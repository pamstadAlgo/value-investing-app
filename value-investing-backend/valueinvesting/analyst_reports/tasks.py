import json
import os
import tempfile
from pathlib import Path

from celery import shared_task

from .models import UserUpload
from . import s3_service, mineru_service, llm


@shared_task
def process_uploaded_file(upload_id):
    upload = UserUpload.objects.get(pk=upload_id)
    upload.status = UserUpload.Status.SCANNING
    upload.save()

    suffix = Path(upload.file_name).suffix
    tmp_fd, tmp_path = tempfile.mkstemp(suffix=suffix)
    os.close(tmp_fd)

    try:
        folder = "/".join(upload.s3_key.split("/")[:-1])
        base_name = Path(upload.file_name).stem

        if upload.ocr_s3_key:
            # OCR already succeeded on a previous attempt — reuse the markdown
            s3_service.download_file(upload.ocr_s3_key, tmp_path)
            with open(tmp_path, encoding="utf-8") as f:
                md_content = f.read()
        else:
            # 1. Download file from S3
            s3_service.download_file(upload.s3_key, tmp_path)

            # 2. Extract text via MinerU
            ocr_result = mineru_service.extract(tmp_path)
            md_content = ocr_result["md_content"]

            # 3. Upload extracted markdown to S3 and persist before LLM step,
            #    so a LLM failure on retry can skip straight to step 4.
            ocr_s3_key = f"{folder}/mineru/{base_name}.md"
            s3_service.upload_text(md_content, ocr_s3_key)
            upload.ocr_s3_key = ocr_s3_key
            upload.save()

        # 4. Run LLM structured extraction
        upload.status = UserUpload.Status.EXTRACTING
        upload.save()
        structured_data = llm.structure(md_content)
        llm_s3_key = f"{folder}/llm/{base_name}.json"
        s3_service.upload_text(
            content=json.dumps(structured_data, indent=2),
            s3_key=llm_s3_key,
            content_type="application/json",
        )

        upload.llm_s3_key = llm_s3_key
        upload.status = UserUpload.Status.DONE
        upload.save()

    except Exception:
        upload.status = UserUpload.Status.FAILED
        upload.save()
        raise

    finally:
        os.unlink(tmp_path)
