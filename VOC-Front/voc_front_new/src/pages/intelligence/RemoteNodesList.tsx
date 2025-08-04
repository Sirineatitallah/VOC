import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TextField } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchRemoteNodes } from '../../utils/api';

interface RemoteNode {
  id: string;
  name: string;
  description: string;
  remote_node_url: string;
  remote_event_source_url: string;
  access_key: string;
  enabled: boolean;
  synchronize_news_items: boolean;
  synchronize_to_osint_source_group: string;
  synchronize_report_items: boolean;
}

const RemoteNodesList: React.FC = () => {
  const [remoteNodes, setRemoteNodes] = useState<RemoteNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadRemoteNodes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchRemoteNodes(searchQuery);
        // Assuming the API returns an array directly, or an object with an 'items' array
        setRemoteNodes(response.items || response);
      } catch (err) {
        console.error('Failed to fetch remote nodes:', err);
        setError('Failed to load remote nodes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadRemoteNodes();
  }, [searchQuery]);

  const handleAddNewRemoteNode = () => {
    navigate('/intelligence/remote-nodes/new');
  };

  const handleRowClick = (id: string) => {
    navigate(`/intelligence/remote-nodes/${id}`);
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
          Remote Nodes ({remoteNodes.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNewRemoteNode}
        >
          Add new remote node
        </Button>
      </Box>

      <TextField
        label="Search Remote Nodes"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          mb: 3,
          '& .MuiInputBase-input': {
            color: 'text.primary',
            '.dark & ': {
              color: '#cbd5e0',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'text.secondary',
            '.dark & ': {
              color: '#a0aec0',
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'grey.400',
            '.dark & ': {
              borderColor: '#4a5568',
            },
          },
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.paper',
            '.dark & ': {
              backgroundColor: '#2e3a47',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
              '.dark & ': {
                borderColor: '#63b3ed',
              },
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
              '.dark & ': {
                borderColor: '#63b3ed',
              },
            },
          },
        }}
      />

      {remoteNodes.length === 0 ? (
        <Alert severity="info" sx={{
          backgroundColor: 'info.light',
          color: 'info.dark',
          border: '1px solid',
          borderColor: 'info.main',
          '.dark & ': {
            backgroundColor: '#2a4365',
            color: '#a7c7ed',
            borderColor: '#4299e1',
          },
        }}>No remote nodes found. Click "Add new remote node" to create one.</Alert>
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
                }}>Name</TableCell>
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
                }}>Enabled</TableCell>
                <TableCell sx={{
                  color: 'text.primary',
                  borderBottom: '1px solid',
                  borderColor: 'grey.300',
                  '.dark & ': {
                    color: '#cbd5e0',
                    borderColor: '#4a5568',
                  },
                }}>Synchronize News</TableCell>
                <TableCell sx={{
                  color: 'text.primary',
                  borderBottom: '1px solid',
                  borderColor: 'grey.300',
                  '.dark & ': {
                    color: '#cbd5e0',
                    borderColor: '#4a5568',
                  },
                }}>Synchronize Reports</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {remoteNodes.map((node) => (
                <TableRow key={node.id} hover onClick={() => handleRowClick(node.id)} sx={{ cursor: 'pointer',
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
                  }}>{node.name}</TableCell>
                  <TableCell sx={{
                    color: 'text.secondary',
                    borderBottom: '1px solid',
                    borderColor: 'grey.300',
                    '.dark & ': {
                      color: '#a0aec0',
                      borderColor: '#4a5568',
                    },
                  }}>{node.description}</TableCell>
                  <TableCell sx={{
                    color: 'text.secondary',
                    borderBottom: '1px solid',
                    borderColor: 'grey.300',
                    '.dark & ': {
                      color: '#a0aec0',
                      borderColor: '#4a5568',
                    },
                  }}>{node.enabled ? 'Yes' : 'No'}</TableCell>
                  <TableCell sx={{
                    color: 'text.secondary',
                    borderBottom: '1px solid',
                    borderColor: 'grey.300',
                    '.dark & ': {
                      color: '#a0aec0',
                      borderColor: '#4a5568',
                    },
                  }}>{node.synchronize_news_items ? 'Yes' : 'No'}</TableCell>
                  <TableCell sx={{
                    color: 'text.secondary',
                    borderBottom: '1px solid',
                    borderColor: 'grey.300',
                    '.dark & ': {
                      color: '#a0aec0',
                      borderColor: '#4a5568',
                    },
                  }}>{node.synchronize_report_items ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default RemoteNodesList; 