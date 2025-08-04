import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TextField } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchBotNodes } from '../../utils/api';

interface BotNode {
  id: string;
  title: string;
  description: string;
  url: string;
}

const BotsNodesList: React.FC = () => {
  const [botNodes, setBotNodes] = useState<BotNode[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBotNodes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchBotNodes(); // This now directly returns an array
        setBotNodes(response);
        setTotalCount(response.length);
      } catch (err) {
        console.error('Failed to fetch bot nodes:', err);
        setError('Failed to load bot nodes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadBotNodes();
  }, []);

  const handleAddNewBotNode = () => {
    navigate('/intelligence/bots-nodes/new');
  };

  const handleRowClick = (id: string) => {
    navigate(`/intelligence/bots-nodes/${id}`);
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
          Bot Nodes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNewBotNode}
        >
          Add new bot node
        </Button>
      </Box>

      {botNodes.length === 0 ? (
        <Alert severity="info">No bot nodes found. Click "Add new bot node" to create one.</Alert>
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
                }}>URL</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {botNodes.map((node) => (
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
                  }}>{node.title}</TableCell>
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
                  }}>{node.url}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default BotsNodesList; 