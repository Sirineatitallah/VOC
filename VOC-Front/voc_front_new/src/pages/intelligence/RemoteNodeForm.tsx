import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Checkbox, FormControlLabel, CircularProgress, Alert, Card, CardContent, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { fetchRemoteNodeById, createRemoteNode, updateRemoteNode, getOsintSourceGroups } from '../../utils/api';

interface RemoteNodeFormFields {
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

interface OsintSourceGroup {
  id: string;
  name: string;
}

const RemoteNodeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RemoteNodeFormFields>({
    name: '',
    description: '',
    remote_node_url: '',
    remote_event_source_url: '',
    access_key: '',
    enabled: true,
    synchronize_news_items: false,
    synchronize_to_osint_source_group: '',
    synchronize_report_items: false,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [osintSourceGroups, setOsintSourceGroups] = useState<OsintSourceGroup[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch OSINT Source Groups
        const osintGroups = await getOsintSourceGroups();
        // Assuming osintGroups can be an array or an object with an 'items' array
        setOsintSourceGroups(osintGroups.items || osintGroups);

        if (id) {
          // Editing existing node
          const nodeData = await fetchRemoteNodeById(id);
          setFormData({
            name: nodeData.name || '',
            description: nodeData.description || '',
            remote_node_url: nodeData.remote_node_url || '',
            remote_event_source_url: nodeData.remote_event_source_url || '',
            access_key: nodeData.access_key || '',
            enabled: nodeData.enabled || false,
            synchronize_news_items: nodeData.synchronize_news_items || false,
            synchronize_to_osint_source_group: nodeData.synchronize_to_osint_source_group || '',
            synchronize_report_items: nodeData.synchronize_report_items || false,
          });
        }
      } catch (err) {
        console.error('Error loading data for form:', err);
        setError('Failed to load form data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (id) {
        // Update existing node
        await updateRemoteNode(id, formData);
        console.log('Remote Node updated successfully!');
      } else {
        // Create new node
        await createRemoteNode(formData);
        console.log('Remote Node created successfully!');
      }
      navigate('/intelligence/remote-nodes'); // Redirect to list page after save
    } catch (err) {
      console.error('Error saving remote node:', err);
      setError('Failed to save remote node. Please try again.');
    } finally {
      setSubmitting(false);
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
      <Typography variant="h4" gutterBottom sx={{
        color: 'text.primary',
        '.dark & ': {
          color: '#e2e8f0',
        },
      }}>
        {id ? 'Edit Remote Node' : 'Add New Remote Node'}
      </Typography>
      <Card sx={{
        backgroundColor: 'background.paper',
        '.dark & ': {
          backgroundColor: '#2e3a47',
        },
      }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Name"
              name="name"
              fullWidth
              margin="normal"
              value={formData.name}
              onChange={handleChange}
              required
              sx={{
                '& .MuiInputBase-input': { // Input text color
                  color: 'text.primary',
                  '.dark & ': {
                    color: '#cbd5e0', // Lighter text in dark mode
                  },
                },
                '& .MuiInputLabel-root': { // Label color
                  color: 'text.secondary',
                  '.dark & ': {
                    color: '#a0aec0', // Lighter label in dark mode
                  },
                },
                '& .MuiOutlinedInput-notchedOutline': { // Border color
                  borderColor: 'grey.400',
                  '.dark & ': {
                    borderColor: '#4a5568', // Darker border in dark mode
                  },
                },
                '& .MuiOutlinedInput-root': { // Background color of input
                  backgroundColor: 'background.paper',
                  '.dark & ': {
                    backgroundColor: '#2e3a47', // Darker background for input
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
            <TextField
              label="Description"
              name="description"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
              sx={{
                '& .MuiInputBase-input': { // Input text color
                  color: 'text.primary',
                  '.dark & ': {
                    color: '#cbd5e0', // Lighter text in dark mode
                  },
                },
                '& .MuiInputLabel-root': { // Label color
                  color: 'text.secondary',
                  '.dark & ': {
                    color: '#a0aec0', // Lighter label in dark mode
                  },
                },
                '& .MuiOutlinedInput-notchedOutline': { // Border color
                  borderColor: 'grey.400',
                  '.dark & ': {
                    borderColor: '#4a5568', // Darker border in dark mode
                  },
                },
                '& .MuiOutlinedInput-root': { // Background color of input
                  backgroundColor: 'background.paper',
                  '.dark & ': {
                    backgroundColor: '#2e3a47', // Darker background for input
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
            <TextField
              label="Remote Node URL"
              name="remote_node_url"
              fullWidth
              margin="normal"
              value={formData.remote_node_url}
              onChange={handleChange}
              required
              sx={{
                '& .MuiInputBase-input': { // Input text color
                  color: 'text.primary',
                  '.dark & ': {
                    color: '#cbd5e0', // Lighter text in dark mode
                  },
                },
                '& .MuiInputLabel-root': { // Label color
                  color: 'text.secondary',
                  '.dark & ': {
                    color: '#a0aec0', // Lighter label in dark mode
                  },
                },
                '& .MuiOutlinedInput-notchedOutline': { // Border color
                  borderColor: 'grey.400',
                  '.dark & ': {
                    borderColor: '#4a5568', // Darker border in dark mode
                  },
                },
                '& .MuiOutlinedInput-root': { // Background color of input
                  backgroundColor: 'background.paper',
                  '.dark & ': {
                    backgroundColor: '#2e3a47', // Darker background for input
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
            <TextField
              label="Remote Event Source URL"
              name="remote_event_source_url"
              fullWidth
              margin="normal"
              value={formData.remote_event_source_url}
              onChange={handleChange}
              sx={{
                '& .MuiInputBase-input': { // Input text color
                  color: 'text.primary',
                  '.dark & ': {
                    color: '#cbd5e0', // Lighter text in dark mode
                  },
                },
                '& .MuiInputLabel-root': { // Label color
                  color: 'text.secondary',
                  '.dark & ': {
                    color: '#a0aec0', // Lighter label in dark mode
                  },
                },
                '& .MuiOutlinedInput-notchedOutline': { // Border color
                  borderColor: 'grey.400',
                  '.dark & ': {
                    borderColor: '#4a5568', // Darker border in dark mode
                  },
                },
                '& .MuiOutlinedInput-root': { // Background color of input
                  backgroundColor: 'background.paper',
                  '.dark & ': {
                    backgroundColor: '#2e3a47', // Darker background for input
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
            <TextField
              label="Access Key"
              name="access_key"
              fullWidth
              margin="normal"
              value={formData.access_key}
              onChange={handleChange}
              required
              sx={{
                '& .MuiInputBase-input': { // Input text color
                  color: 'text.primary',
                  '.dark & ': {
                    color: '#cbd5e0', // Lighter text in dark mode
                  },
                },
                '& .MuiInputLabel-root': { // Label color
                  color: 'text.secondary',
                  '.dark & ': {
                    color: '#a0aec0', // Lighter label in dark mode
                  },
                },
                '& .MuiOutlinedInput-notchedOutline': { // Border color
                  borderColor: 'grey.400',
                  '.dark & ': {
                    borderColor: '#4a5568', // Darker border in dark mode
                  },
                },
                '& .MuiOutlinedInput-root': { // Background color of input
                  backgroundColor: 'background.paper',
                  '.dark & ': {
                    backgroundColor: '#2e3a47', // Darker background for input
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.enabled}
                  onChange={handleChange}
                  name="enabled"
                  sx={{
                    color: 'grey.700',
                    '.dark & ': {
                      color: '#a0aec0',
                    },
                    '&.Mui-checked': {
                      color: 'primary.main',
                      '.dark & ': {
                        color: '#63b3ed',
                      },
                    },
                  }}
                />
              }
              label="Enabled"
              sx={{ mt: 2,
                '& .MuiTypography-root': {
                  color: 'text.primary',
                  '.dark & ': {
                    color: '#cbd5e0',
                  },
                },
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.synchronize_news_items}
                  onChange={handleChange}
                  name="synchronize_news_items"
                  sx={{
                    color: 'grey.700',
                    '.dark & ': {
                      color: '#a0aec0',
                    },
                    '&.Mui-checked': {
                      color: 'primary.main',
                      '.dark & ': {
                        color: '#63b3ed',
                      },
                    },
                  }}
                />
              }
              label="Synchronize news items"
              sx={{ mt: 2,
                '& .MuiTypography-root': {
                  color: 'text.primary',
                  '.dark & ': {
                    color: '#cbd5e0',
                  },
                },
              }}
            />
            
            <FormControl fullWidth margin="normal" sx={{
              '& .MuiInputBase-input': { // Input text color
                color: 'text.primary',
                '.dark & ': {
                  color: '#cbd5e0', // Lighter text in dark mode
                },
              },
              '& .MuiInputLabel-root': { // Label color
                color: 'text.secondary',
                '.dark & ': {
                  color: '#a0aec0', // Lighter label in dark mode
                },
              },
              '& .MuiOutlinedInput-notchedOutline': { // Border color
                borderColor: 'grey.400',
                '.dark & ': {
                  borderColor: '#4a5568', // Darker border in dark mode
                },
              },
              '& .MuiOutlinedInput-root': { // Background color of input
                backgroundColor: 'background.paper',
                '.dark & ': {
                  backgroundColor: '#2e3a47', // Darker background for input
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
              '& .MuiSvgIcon-root': { // Dropdown icon color
                color: 'text.secondary',
                '.dark & ': {
                  color: '#a0aec0',
                },
              },
            }}>
              <InputLabel id="osint-source-group-label">Synchronize to OSINT source group</InputLabel>
              <Select
                labelId="osint-source-group-label"
                name="synchronize_to_osint_source_group"
                value={formData.synchronize_to_osint_source_group}
                onChange={handleChange}
                label="Synchronize to OSINT source group"
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: 'background.paper',
                      '.dark & ': {
                        backgroundColor: '#2e3a47',
                      },
                    },
                  },
                }}
              >
                <MenuItem value="" sx={{
                  color: 'text.primary',
                  '.dark & ': {
                    color: '#cbd5e0',
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '.dark & ': {
                    '&:hover': {
                      backgroundColor: '#4a5568',
                    },
                  },
                }}><em>None</em></MenuItem>
                {osintSourceGroups.map((group) => (
                  <MenuItem key={group.id} value={group.id} sx={{
                    color: 'text.primary',
                    '.dark & ': {
                      color: '#cbd5e0',
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    '.dark & ': {
                      '&:hover': {
                        backgroundColor: '#4a5568',
                      },
                    },
                  }}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.synchronize_report_items}
                  onChange={handleChange}
                  name="synchronize_report_items"
                  sx={{
                    color: 'grey.700',
                    '.dark & ': {
                      color: '#a0aec0',
                    },
                    '&.Mui-checked': {
                      color: 'primary.main',
                      '.dark & ': {
                        color: '#63b3ed',
                      },
                    },
                  }}
                />
              }
              label="Synchronize report items"
              sx={{ mt: 2,
                '& .MuiTypography-root': {
                  color: 'text.primary',
                  '.dark & ': {
                    color: '#cbd5e0',
                  },
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={submitting}
              sx={{ mt: 3 }}
            >
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RemoteNodeForm; 