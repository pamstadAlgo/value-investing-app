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
import WatchlistTable from "./components/WatchlistTable";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  IconButton,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ShareIcon from "@mui/icons-material/Share";

const TextActionBtn = React.memo(({ label, onClick, color = "var(--text-color-grey-scale)" }) => (
  <Button
    onClick={onClick}
    disableRipple
    sx={{
      minWidth: 0,
      padding: "0 8px",
      color: color,
      fontFamily: "var(--font-family)",
      fontSize: "0.85rem",
      fontWeight: 600,
      textTransform: "none",
      "&:hover": {
        color: "var(--action-color)",
        backgroundColor: "transparent",
        textDecoration: "underline"
      }
    }}
  >
    [{label}]
  </Button>
));

const WatchlistPage = () => {
  const dispatch = useDispatch();
  const { watchlists, status } = useSelector((state) => state.watchlist);

  const [activeListId, setActiveListId] = useState(null);
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  
  const [newListTitle, setNewListTitle] = useState("");
  const [shareEmail, setShareEmail] = useState("");

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

  const activeList = useMemo(() => 
    watchlists.find((w) => w.id === activeListId), 
    [watchlists, activeListId]
  );

  const handleCreate = useCallback(() => {
    if (newListTitle.trim()) {
      dispatch(createWatchlist({ title: newListTitle }))
        .unwrap()
        .then((newList) => {
          setActiveListId(newList.id);
          setNewListTitle("");
          setIsCreateOpen(false);
        })
        .catch((err) => alert(err.message));
    }
  }, [newListTitle, dispatch]);

  const handleShare = useCallback(() => {
    if (shareEmail.trim() && activeListId) {
        dispatch(shareWatchlist({ watchlistId: activeListId, email: shareEmail }))
            .unwrap()
            .then(() => {
                alert(`Successfully shared with ${shareEmail}`);
                setShareEmail("");
                setIsShareOpen(false);
            })
            .catch((err) => alert(`Failed to share: ${err.message || "User not found"}`));
    }
  }, [shareEmail, activeListId, dispatch]);

  const handleDeleteList = useCallback(() => {
    if (activeListId && window.confirm("Are you sure you want to delete this watchlist?")) {
      dispatch(deleteWatchlist(activeListId));
      setActiveListId(null);
    }
  }, [activeListId, dispatch]);

  const handleRemoveStock = useCallback((ticker) => {
    if (activeListId) {
      dispatch(removeStockFromWatchlist({ watchlistId: activeListId, ticker }));
    }
  }, [activeListId, dispatch]);

  return (
    <Layout>
      <Box 
        sx={{ 
          display: "flex", 
          height: "calc(100vh - 100px)", 
          border: "1px solid var(--border-input-fields)", 
          bgcolor: "var(--background-glass-card)",
          boxSizing: 'border-box'
        }}
      >
        {/* === SIDEBAR === */}
        <Box
          sx={{
            width: 260,
            flexShrink: 0,
            borderRight: "1px solid var(--border-input-fields)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* HEADER */}
          <Box 
            sx={{ 
              height: "48px", 
              display: "flex", 
              alignItems: "center",
              px: 2, 
              borderBottom: "1px solid var(--border-input-fields)",
              boxSizing: "border-box" 
            }}
          >
            <Typography variant="subtitle2" sx={{ fontFamily: "var(--font-family)", color: "var(--text-color-grey-scale)", letterSpacing: "1px" }}>
              WATCHLISTS
            </Typography>
          </Box>

          <List sx={{ flex: 1, overflowY: "auto", p: 0 }}>
            {watchlists.map((list) => {
              const isActive = activeListId === list.id;
              return (
                <ListItem key={list.id} disablePadding>
                  <ListItemButton
                    onClick={() => setActiveListId(list.id)}
                    sx={{
                      height: "40px",
                      borderLeft: isActive ? "3px solid var(--action-color)" : "3px solid transparent",
                      backgroundColor: isActive ? "var(--action-color-more-transparent)" : "transparent",
                      color: isActive ? "var(--action-color)" : "var(--header-color)",
                      "&:hover": { 
                          backgroundColor: "var(--input-fields-hover-bg-color)",
                      }
                    }}
                  >
                    <Typography 
                      sx={{ 
                        fontFamily: "var(--font-family)", 
                        fontSize: "0.9rem",
                        fontWeight: isActive ? 600 : 400,
                        ml: 1
                      }}
                    >
                      {list.title}
                    </Typography>
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          <Box sx={{ p: 1, borderTop: "1px solid var(--border-input-fields)", textAlign: 'center' }}>
             <TextActionBtn label="+ NEW LIST" onClick={() => setIsCreateOpen(true)} color="var(--header-color)" />
          </Box>
        </Box>

        {/* === MAIN CONTENT === */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: "hidden" }}>
          
          {activeList ? (
            <>
              {/* HEADER */}
              <Box 
                sx={{ 
                  height: "48px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  px: 2,
                  borderBottom: "1px solid var(--border-input-fields)",
                  bgcolor: "var(--background-color-nav-bar)",
                  boxSizing: "border-box"
                }}
              >
                <Typography sx={{ fontFamily: "var(--font-family)", fontWeight: 700, color: "var(--action-color)", textTransform: "uppercase" }}>
                  {activeList.title}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextActionBtn label="SHARE" onClick={() => setIsShareOpen(true)} />
                  <TextActionBtn label="DELETE LIST" onClick={handleDeleteList} color="var(--error-red)" />
                </Box>
              </Box>

              <Box sx={{ flex: 1, overflow: "hidden", position: "relative" }}>
                <WatchlistTable 
                  data={activeList.items || []} 
                  onRemove={handleRemoveStock} 
                />
              </Box>

              <Box 
                sx={{ 
                  height: "32px", 
                  borderTop: "1px solid var(--border-input-fields)",
                  display: "flex",
                  alignItems: "center",
                  px: 2,
                  gap: 4,
                  bgcolor: "#000" 
                }}
              >
                <Typography variant="caption" sx={{ fontFamily: "var(--font-family)", color: "gray" }}>
                  STATUS: <span style={{ color: "var(--success-color)" }}>READY</span>
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: "var(--font-family)", color: "gray" }}>
                  ITEMS: <span style={{ color: "var(--header-color)" }}>{activeList.items?.length || 0}</span>
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: "var(--font-family)", color: "gray" }}>
                  OWNER: <span style={{ color: "var(--header-color)" }}>{activeList.owner_name?.toUpperCase() || "ME"}</span>
                </Typography>
              </Box>
            </>
          ) : (
            <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography sx={{ fontFamily: "var(--font-family)", color: "gray" }}>
                [ NO LIST SELECTED ]
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* --- DIALOGS --- */}
      <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <DialogTitle sx={{ fontFamily: 'var(--font-family)', color: 'var(--header-color)' }}>NEW LIST</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="LIST TITLE"
            fullWidth
            variant="standard"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            InputLabelProps={{ style: { fontFamily: 'var(--font-family)' } }}
            InputProps={{ style: { fontFamily: 'var(--font-family)' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateOpen(false)} sx={{ color: 'var(--text-color-grey-scale)', fontFamily: 'var(--font-family)' }}>CANCEL</Button>
          <Button onClick={handleCreate} sx={{ color: 'var(--action-color)', fontFamily: 'var(--font-family)', fontWeight: 'bold' }}>CREATE</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isShareOpen} onClose={() => setIsShareOpen(false)}>
        <DialogTitle sx={{ fontFamily: 'var(--font-family)', color: 'var(--header-color)' }}>SHARE LIST</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="USER EMAIL"
            type="email"
            fullWidth
            variant="standard"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            InputLabelProps={{ style: { fontFamily: 'var(--font-family)' } }}
            InputProps={{ style: { fontFamily: 'var(--font-family)' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsShareOpen(false)} sx={{ color: 'var(--text-color-grey-scale)', fontFamily: 'var(--font-family)' }}>CANCEL</Button>
          <Button onClick={handleShare} sx={{ color: 'var(--action-color)', fontFamily: 'var(--font-family)', fontWeight: 'bold' }}>SHARE</Button>
        </DialogActions>
      </Dialog>

    </Layout>
  );
};

export default WatchlistPage;