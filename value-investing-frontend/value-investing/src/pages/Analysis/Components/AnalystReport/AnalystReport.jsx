import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import DropZone from "./DropZone";
import StagedFilesList from "./StagedFilesList";
import UploadedFilesList from "./UploadedFilesList";
import { loadStagedFiles, saveStagedFiles } from "./fileStorageService";
import axiosInstance from "../../../../axios/axiosConfig";
import { useSnackbar } from "../../../GlobalComponents/SnackbarProvider";

function AnalystReport() {
  const [stagedFiles, setStagedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [duplicateNames, setDuplicateNames] = useState([]);
  const [processing, setProcessing] = useState(false);

  const { showMessage } = useSnackbar();
  const analysisState = useSelector((state) => state.analysis);
  const qfs_symbol = analysisState?.selectedTickerSymbol?.qfs_symbol;

  const fetchUploadedFiles = useCallback(async () => {
    if (!qfs_symbol) return;
    try {
      const { data } = await axiosInstance.get(`/analyst-reports/${qfs_symbol}/`);
      setUploadedFiles(data);
    } catch {
      showMessage("Failed to load uploaded files.", "error");
    }
  }, [qfs_symbol]);

  useEffect(() => {
    loadStagedFiles().then(setStagedFiles);
  }, []);

  useEffect(() => {
    fetchUploadedFiles();
  }, [fetchUploadedFiles]);

  useEffect(() => {
    const shouldPoll = uploadedFiles.some((f) => ["uploaded", "scanning", "extracting"].includes(f.status));
    if (!shouldPoll) return;

    const interval = setInterval(fetchUploadedFiles, 3000);
    return () => clearInterval(interval);
  }, [uploadedFiles, fetchUploadedFiles]);

  const handleFilesAdded = async (newFiles) => {
    const existingNames = new Set(stagedFiles.map((f) => f.name));
    const accepted = newFiles.filter((f) => !existingNames.has(f.name));
    const duplicates = newFiles.filter((f) => existingNames.has(f.name)).map((f) => f.name);

    setDuplicateNames(duplicates);

    if (duplicates.length > 0) {
      showMessage(`Already staged (skipped): ${duplicates.join(", ")}`, "warning");
    }

    if (accepted.length === 0) return;

    const updated = [...stagedFiles, ...accepted];
    setStagedFiles(updated);
    await saveStagedFiles(updated);
  };

  const handleRemove = async (id) => {
    const updated = stagedFiles.filter((f) => f.id !== id);
    setStagedFiles(updated);
    await saveStagedFiles(updated);
  };

  const handleRetry = async (uploadId) => {
    try {
      await axiosInstance.post(`/analyst-reports/retry/${uploadId}/`);
      await fetchUploadedFiles();
    } catch (err) {
      showMessage(err.response?.data?.error || "Retry failed.", "error");
    }
  };

  const handleProcessFiles = async () => {
    setProcessing(true);
    try {
      for (const file of stagedFiles) {
        // 1. Get presigned PUT URL from backend
        const { data: { presigned_url, s3_key } } = await axiosInstance.post(
          "/analyst-reports/presigned-url/",
          { qfs_symbol, file_name: file.name, file_type: file.type }
        );

        // 2. Upload file bytes directly to S3 — plain fetch, no auth header
        const blob = new Blob([file.data], { type: file.type });
        const s3Response = await fetch(presigned_url, {
          method: "PUT",
          body: blob,
          headers: { "Content-Type": file.type },
        });

        if (!s3Response.ok) {
          throw new Error(`S3 upload failed for ${file.name}: ${s3Response.statusText}`);
        }

        // 3. Confirm upload to backend so DB record is created
        await axiosInstance.post("/analyst-reports/confirm/", {
          qfs_symbol,
          s3_key,
          file_name: file.name,
          file_type: file.type,
        });
      }

      // 4. Clear staged files and refresh the uploaded list
      await saveStagedFiles([]);
      setStagedFiles([]);
      setDuplicateNames([]);
      await fetchUploadedFiles();
      showMessage("Files uploaded successfully.", "success");
    } catch (err) {
      showMessage(err.message || "Upload failed. Please try again.", "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography className="title-mid-size" sx={{ mb: 1 }}>
        Analyst Report
      </Typography>
      <Typography sx={{ color: "var(--text-color-grey-scale)", fontSize: "0.85rem", mb: 3 }}>
        Upload documents to be extracted and included in the analyst report.
      </Typography>

      <DropZone onFilesAdded={handleFilesAdded} />

      <StagedFilesList files={stagedFiles} onRemove={handleRemove} />

      <Box sx={{ mt: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
        <Button
          variant="contained"
          disabled={stagedFiles.length === 0 || processing}
          className="contained-custom-button"
          onClick={handleProcessFiles}>
          {processing ? "Uploading..." : "Process Files"}
        </Button>
        {processing && <CircularProgress className="custom-circular-progress" />}
      </Box>

      <UploadedFilesList files={uploadedFiles} onRetry={handleRetry} />
    </Box>
  );
}

export default AnalystReport;
