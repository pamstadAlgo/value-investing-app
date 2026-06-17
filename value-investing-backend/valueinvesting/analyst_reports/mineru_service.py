import asyncio
from pathlib import Path

import httpx
from django.conf import settings


def _headers() -> dict:
    return {
        "Modal-Key": settings.MODAL_KEY,
        "Modal-Secret": settings.MODAL_SECRET,
    }


async def _submit_task(tmp_path: str) -> str:
    async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
        response = await client.post(
            f"{settings.MINERU_API_URL}/tasks",
            headers=_headers(),
            files={"files": (Path(tmp_path).name, open(tmp_path, "rb"), "application/octet-stream")},
            data={
                "return_md": "true",
                "return_middle_json": "true",
                "backend": "vlm-auto-engine",
                "table_enable": "true",
                "image_analysis": "true",
                "return_model_output": "true",
                "return_content_list": "true",
            },
        )
    response.raise_for_status()
    return response.json()["task_id"]


async def _poll_until_done(task_id: str) -> None:
    async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
        while True:
            response = await client.get(
                f"{settings.MINERU_API_URL}/tasks/{task_id}",
                headers=_headers(),
            )
            response.raise_for_status()
            status = response.json()["status"]

            if status == "completed":
                return
            if status == "failed":
                raise RuntimeError(f"MinerU task failed: {task_id}")

            await asyncio.sleep(4)


async def _fetch_result(task_id: str) -> dict:
    async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
        response = await client.get(
            f"{settings.MINERU_API_URL}/tasks/{task_id}/result",
            headers=_headers(),
        )
    response.raise_for_status()
    raw = response.json()
    return next(iter(raw["results"].values()))


async def _extract(tmp_path: str) -> dict:
    task_id = await _submit_task(tmp_path)
    await _poll_until_done(task_id)
    return await _fetch_result(task_id)


def extract(tmp_path: str) -> dict:
    """Synchronous entry point — bridges Celery (sync) to async httpx calls."""
    return asyncio.run(_extract(tmp_path))
