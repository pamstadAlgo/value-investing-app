import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWatchlists,
  createWatchlist,
  deleteWatchlist,
  removeStockFromWatchlist,
  shareWatchlist,
} from "../../features/watchlistSlice";
import Layout from "../GlobalComponents/Layout";
import { Box } from "@mui/material";

// Sub-components
import WatchlistSidebar from "./components/WatchlistSidebar";
import WatchlistContent from "./components/WatchlistContent";
import WatchlistDialogs from "./components/WatchlistDialogs";
import { useSnackbar } from "../GlobalComponents/SnackbarProvider";

const WatchlistPage = () => {
  const dispatch = useDispatch();
  const { watchlists, status } = useSelector((state) => state.watchlist);

  const [activeListId, setActiveListId] = useState(null);
  const { showMessage } = useSnackbar();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // --- Effects ---
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchWatchlists());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (watchlists.length > 0 && !activeListId) {
      setActiveListId(watchlists[0].id);
    }
  }, [watchlists, activeListId]);

  // --- Derived State ---
  const activeList = useMemo(
    () => watchlists.find((w) => w.id === activeListId),
    [watchlists, activeListId]
  );

  // --- Handlers ---
  const handleCreate = useCallback(
    (title) => {
      dispatch(createWatchlist({ title }))
        .unwrap()
        .then((newList) => {
          setActiveListId(newList.id);
          setIsCreateOpen(false);
        })
        .catch((err) => alert(err.message));
    },
    [dispatch]
  );

  const handleShare = useCallback(
    (email) => {
      if (activeListId) {
        dispatch(shareWatchlist({ watchlistId: activeListId, email }))
          .unwrap()
          .then(() => {
            showMessage(`Successfully shared with ${email}`);
            setIsShareOpen(false);
          })
          .catch((err) => {
            showMessage(
              `Failed to share: ${err.message || "User not found"}`,
              "error"
            );
          });
      }
    },
    [activeListId, dispatch]
  );

  const handleDeleteList = useCallback(() => {
    if (
      activeListId &&
      window.confirm("Are you sure you want to delete this watchlist?")
    ) {
      dispatch(deleteWatchlist(activeListId));
      setActiveListId(null);
    }
  }, [activeListId, dispatch]);

  const handleRemoveStock = useCallback(
    (ticker) => {
      if (activeListId) {
        dispatch(
          removeStockFromWatchlist({ watchlistId: activeListId, ticker })
        );
      }
    },
    [activeListId, dispatch]
  );

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          height: "calc(100vh - 100px)",
          border: "1px solid var(--border-input-fields)",
          bgcolor: "var(--background-glass-card)",
          boxSizing: "border-box",
        }}>
        {/* SIDEBAR */}
        <WatchlistSidebar
          watchlists={watchlists}
          activeListId={activeListId}
          onSelect={setActiveListId}
          onCreateClick={() => setIsCreateOpen(true)}
        />

        {/* MAIN CONTENT */}
        <WatchlistContent
          activeList={activeList}
          onShareClick={() => setIsShareOpen(true)}
          onDeleteClick={handleDeleteList}
          onRemoveStock={handleRemoveStock}
        />
      </Box>

      {/* DIALOGS */}
      <WatchlistDialogs
        isCreateOpen={isCreateOpen}
        isShareOpen={isShareOpen}
        onCloseCreate={() => setIsCreateOpen(false)}
        onCloseShare={() => setIsShareOpen(false)}
        onCreate={handleCreate}
        onShare={handleShare}
      />
    </Layout>
  );
};

export default WatchlistPage;
