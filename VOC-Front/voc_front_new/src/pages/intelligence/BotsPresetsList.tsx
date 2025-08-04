import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TextField, IconButton, Tooltip } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchBotPresets, deleteBotPreset } from '../../utils/api';

interface BotPreset {
  id: string;
  title: string;
  description: string;
}

const BotsPresetsList: React.FC = () => {
  const [botPresets, setBotPresets] = useState<BotPreset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

    const loadBotPresets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchBotPresets();
        if (response && Array.isArray(response.items)) {
          setBotPresets(response.items);
          setTotalCount(response.total_count || response.items.length);
        } else if (Array.isArray(response)) {
          setBotPresets(response);
          setTotalCount(response.length);
        } else {
          setBotPresets([]);
          setTotalCount(0);
        }
      } catch (err) {
        console.error('Failed to fetch bot presets:', err);
        setError('Failed to load bot presets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadBotPresets();
  }, []);

  const handleAddNewBotPreset = () => {
    navigate('/intelligence/bots-presets/new');
  };

  const handleRowClick = (id: string) => {
    navigate(`/intelligence/bots-presets/${id}`);
  };

  const handleDeleteBotPreset = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Empêcher la navigation vers la page d'édition
    
    if (window.confirm('Are you sure you want to delete this bot preset? This action cannot be undone.')) {
      setDeletingId(id);
      try {
        await deleteBotPreset(id);
        // Recharger la liste après suppression
        await loadBotPresets();
      } catch (err) {
        console.error('Failed to delete bot preset:', err);
        setError('Failed to delete bot preset. Please try again.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Bot Presets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNewBotPreset}
        >
          Add new bot preset
        </Button>
      </Box>

      {botPresets.length === 0 ? (
        <Alert severity="info">No bot presets found. Click "Add new bot preset" to create one.</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ backgroundColor: 'background.paper', '&.MuiPaper-root': { backgroundColor: 'inherit', border: '1px solid', borderColor: 'grey.300' },
          '.dark & ': {
            backgroundColor: '#2e3a47',
            borderColor: '#4a5568',
          },
        }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{
                  color: 'text.primary',
                  borderBottom: '1px solid',
                  borderColor: 'grey.300',
                  '.dark & ': {
                    color: '#cbd5e0',
                    borderColor: '#4a5568',
                  },
                }}>Title</TableCell>
                <TableCell sx={{
                  color: 'text.primary',
                  borderBottom: '1px solid',
                  borderColor: 'grey.300',
                  '.dark & ': {
                    color: '#cbd5e0',
                    borderColor: '#4a5568',
                  },
                }}>Description</TableCell>
                <TableCell sx={{
                  color: 'text.primary',
                  borderBottom: '1px solid',
                  borderColor: 'grey.300',
                  '.dark & ': {
                    color: '#cbd5e0',
                    borderColor: '#4a5568',
                  },
                }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {botPresets.map((preset) => (
                <TableRow key={preset.id} hover onClick={() => handleRowClick(preset.id)} sx={{ cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '.dark & ': {
                    '&:hover': {
                      backgroundColor: '#4a5568',
                    },
                  },
                }}>
                  <TableCell sx={{
                    color: 'text.secondary',
                    borderBottom: '1px solid',
                    borderColor: 'grey.300',
                    '.dark & ': {
                      color: '#a0aec0',
                      borderColor: '#4a5568',
                    },
                  }}>{preset.title}</TableCell>
                  <TableCell sx={{
                    color: 'text.secondary',
                    borderBottom: '1px solid',
                    borderColor: 'grey.300',
                    '.dark & ': {
                      color: '#a0aec0',
                      borderColor: '#4a5568',
                    },
                  }}>{preset.description}</TableCell>
                  <TableCell sx={{
                    borderBottom: '1px solid',
                    borderColor: 'grey.300',
                    '.dark & ': {
                      borderColor: '#4a5568',
                    },
                  }}>
                    <Tooltip title="Delete bot preset">
                      <IconButton
                        onClick={(e) => handleDeleteBotPreset(preset.id, e)}
                        disabled={deletingId === preset.id}
                        sx={{
                          color: 'error.main',
                          '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'error.contrastText',
                          },
                          '.dark & ': {
                            color: '#f56565',
                            '&:hover': {
                              backgroundColor: '#e53e3e',
                              color: 'white',
                            },
                          },
                        }}
                      >
                        {deletingId === preset.id ? <CircularProgress size={20} /> : <DeleteIcon />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default BotsPresetsList; 