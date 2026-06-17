import os
import tempfile
from pathlib import Path

from celery import shared_task

from .models import UserUpload
from . import s3_service, mineru_service


@shared_task
def process_uploaded_file(upload_id):
    upload = UserUpload.objects.get(pk=upload_id)
    upload.status = UserUpload.Status.PROCESSING
    upload.save()

    suffix = Path(upload.file_name).suffix
    tmp_fd, tmp_path = tempfile.mkstemp(suffix=suffix)
    os.close(tmp_fd)

    try:
        # 1. Download file from S3
        s3_service.download_file(upload.s3_key, tmp_path)

        # 2. Extract text via MinerU
        ocr_result = mineru_service.extract(tmp_path)
        md_content = ocr_result["md_content"]

        # 3. Upload extracted markdown back to S3
        folder = "/".join(upload.s3_key.split("/")[:-1])
        base_name = Path(upload.file_name).stem
        ocr_s3_key = f"{folder}/mineru/{base_name}.md"
        s3_service.upload_text(md_content, ocr_s3_key)

        # TODO: LLM structured output
        # structured_data = llm_service.structure(md_content)

        upload.ocr_s3_key = ocr_s3_key
        upload.status = UserUpload.Status.DONE
        upload.save()

    except Exception:
        upload.status = UserUpload.Status.FAILED
        upload.save()
        raise

    finally:
        os.unlink(tmp_path)
