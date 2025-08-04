import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TextField, Chip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchRemoteAccesses } from '../../utils/api';

interface RemoteAccess {
  id: string;
  name: string;
  description: string;
  access_key: string;
  enabled: boolean;
}

const RemoteAccessList: React.FC = () => {
  const [remoteAccesses, setRemoteAccesses] = useState<RemoteAccess[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadRemoteAccesses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchRemoteAccesses(searchQuery);
        // Assuming the API returns an array directly, or an object with an 'items' array
        setRemoteAccesses(response.items || response);
      } catch (err) {
        console.error('Failed to fetch remote accesses:', err);
        setError('Failed to load remote accesses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadRemoteAccesses();
  }, [searchQuery]);

  const handleAddNewRemoteAccess = () => {
    navigate('/intelligence/remote-accesses/new');
  };

  const handleRowClick = (id: string) => {
    navigate(`/intelligence/remote-accesses/${id}`);
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
          Remote Accesses ({remoteAccesses.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNewRemoteAccess}
        >
          Add new remote access
        </Button>
      </Box>

      <TextField
        label="Search Remote Accesses"
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

      {remoteAccesses.length === 0 ? (
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
        }}>No remote accesses found. Click "Add new remote access" to create one.</Alert>
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
                }}>Access Key</TableCell>
                <TableCell sx={{
                  color: 'text.primary',
                  borderBottom: '1px solid',
                  borderColor: 'grey.300',
                  '.dark & ': {
                    color: '#cbd5e0',
                    borderColor: '#4a5568',
                  },
                }}>Enabled</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {remoteAccesses.map((access) => (
                <TableRow key={access.id} hover onClick={() => handleRowClick(access.id)} sx={{ cursor: 'pointer',
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
                  }}>{access.name}</TableCell>
                  <TableCell sx={{
                    color: 'text.secondary',
                    borderBottom: '1px solid',
                    borderColor: 'grey.300',
                    '.dark & ': {
                      color: '#a0aec0',
                      borderColor: '#4a5568',
                    },
                  }}>{access.description}</TableCell>
                  <TableCell sx={{
                    color: 'text.secondary',
                    borderBottom: '1px solid',
                    borderColor: 'grey.300',
                    '.dark & ': {
                      color: '#a0aec0',
                      borderColor: '#4a5568',
                    },
                  }}>{access.access_key}</TableCell>
                  <TableCell sx={{
                    color: 'text.secondary',
                    borderBottom: '1px solid',
                    borderColor: 'grey.300',
                    '.dark & ': {
                      color: '#a0aec0',
                      borderColor: '#4a5568',
                    },
                  }}>
                    <Chip label={access.enabled ? 'True' : 'False'} color={access.enabled ? 'success' : 'error'} size="small" sx={{
                      '&.MuiChip-colorSuccess': {
                        backgroundColor: 'success.main',
                        color: 'success.contrastText',
                        '.dark & ': {
                          backgroundColor: '#38a169',
                          color: 'white',
                        },
                      },
                      '&.MuiChip-colorError': {
                        backgroundColor: 'error.main',
                        color: 'error.contrastText',
                        '.dark & ': {
                          backgroundColor: '#e53e3e',
                          color: 'white',
                        },
                      },
                    }} />
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

export default RemoteAccessList; 