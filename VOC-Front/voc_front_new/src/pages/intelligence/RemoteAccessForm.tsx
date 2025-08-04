import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Checkbox, FormControlLabel, CircularProgress, Alert, Card, CardContent, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, TablePagination } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { fetchRemoteAccessById, createRemoteAccess, updateRemoteAccess, getOsintSources, fetchReportItemTypesSimple } from '../../utils/api';

interface RemoteAccessFormFields {
  name: string;
  description: string;
  access_key: string;
  enabled: boolean;
  osint_source_ids: string[];
  report_item_type_ids: string[];
}

interface OsintSource {
  id: string;
  name: string;
  description: string;
}

interface ReportItemType {
  id: string;
  name: string;
  description: string;
}

const RemoteAccessForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RemoteAccessFormFields>({
    name: '',
    description: '',
    access_key: '',
    enabled: true,
    osint_source_ids: [],
    report_item_type_ids: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [osintSources, setOsintSources] = useState<OsintSource[]>([]);
  const [reportItemTypes, setReportItemTypes] = useState<ReportItemType[]>([]);

  // Pagination for OSINT Sources
  const [osintSourcesPage, setOsintSourcesPage] = useState(0);
  const [osintSourcesRowsPerPage, setOsintSourcesRowsPerPage] = useState(10);

  // Pagination for Report Item Types
  const [reportItemTypesPage, setReportItemTypesPage] = useState(0);
  const [reportItemTypesRowsPerPage, setReportItemTypesRowsPerPage] = useState(10);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch OSINT Sources
        const sources = await getOsintSources();
        setOsintSources(sources);

        // Fetch Report Item Types
        const reportTypes = await fetchReportItemTypesSimple();
        setReportItemTypes(reportTypes);

        if (id) {
          // Editing existing remote access
          const accessData = await fetchRemoteAccessById(id);
          setFormData({
            name: accessData.name || '',
            description: accessData.description || '',
            access_key: accessData.access_key || '',
            enabled: accessData.enabled || false,
            osint_source_ids: accessData.osint_source_ids || [],
            report_item_type_ids: accessData.report_item_type_ids || [],
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

  const handleOsintSourceChange = (sourceId: string) => {
    setFormData((prev) => {
      const newOsintSourceIds = prev.osint_source_ids.includes(sourceId)
        ? prev.osint_source_ids.filter((id) => id !== sourceId)
        : [...prev.osint_source_ids, sourceId];
      return { ...prev, osint_source_ids: newOsintSourceIds };
    });
  };

  const handleReportItemTypeChange = (typeId: string) => {
    setFormData((prev) => {
      const newReportItemTypeIds = prev.report_item_type_ids.includes(typeId)
        ? prev.report_item_type_ids.filter((id) => id !== typeId)
        : [...prev.report_item_type_ids, typeId];
      return { ...prev, report_item_type_ids: newReportItemTypeIds };
    });
  };

  const handleReportItemTypesChangePage = (event: unknown, newPage: number) => {
    setReportItemTypesPage(newPage);
  };

  const handleReportItemTypesChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReportItemTypesRowsPerPage(parseInt(event.target.value, 10));
    setReportItemTypesPage(0);
  };
  const handleOsintSourcesChangePage = (event: unknown, newPage: number) => {
    setOsintSourcesPage(newPage);
  };
  const handleOsintSourcesChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOsintSourcesRowsPerPage(parseInt(event.target.value, 10));
    setOsintSourcesPage(0);
  };
  
  const handleOsintSourcesRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOsintSourcesRowsPerPage(parseInt(event.target.value, 10));
    setOsintSourcesPage(0);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (id) {
        // Update existing remote access
        await updateRemoteAccess(id, formData);
        console.log('Remote Access updated successfully!');
      } else {
        // Create new remote access
        await createRemoteAccess(formData);
        console.log('Remote Access created successfully!');
      }
      navigate('/intelligence/remote-accesses'); // Redirect to list page after save
    } catch (err) {
      console.error('Error saving remote access:', err);
      setError('Failed to save remote access. Please try again.');
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
        {id ? 'Edit Remote Access' : 'Add New Remote Access'}
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
            <TextField
              label="Access Key"
              name="access_key"
              fullWidth
              margin="normal"
              value={formData.access_key}
              onChange={handleChange}
              required
              sx={{
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

            <Typography variant="h6" sx={{ mt: 4, mb: 2,
              color: 'text.primary',
              '.dark & ': {
                color: '#e2e8f0',
              },
            }}>OSINT Sources to share</Typography>
            <TableContainer component={Paper} sx={{ backgroundColor: 'background.paper', '&.MuiPaper-root': { backgroundColor: 'inherit', border: '1px solid', borderColor: 'grey.300' },
              '.dark & ': {
                backgroundColor: '#2e3a47',
                borderColor: '#4a5568',
              },
            }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{
                      borderBottom: '1px solid',
                      borderColor: 'grey.300',
                      '.dark & ': {
                        borderColor: '#4a5568',
                      },
                    }}></TableCell>
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {osintSources.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{
                        color: 'text.secondary',
                        borderBottom: '1px solid',
                        borderColor: 'grey.300',
                        '.dark & ': {
                          color: '#a0aec0',
                          borderColor: '#4a5568',
                        },
                      }}>No OSINT Sources available</TableCell>
                    </TableRow>
                  ) : (
                    osintSources.slice(osintSourcesPage * osintSourcesRowsPerPage, osintSourcesPage * osintSourcesRowsPerPage + osintSourcesRowsPerPage).map((source) => (
                      <TableRow key={source.id} hover sx={{ cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                        '.dark & ': {
                          '&:hover': {
                            backgroundColor: '#4a5568',
                          },
                        },
                      }}>
                        <TableCell padding="checkbox" sx={{
                          borderBottom: '1px solid',
                          borderColor: 'grey.300',
                          '.dark & ': {
                            borderColor: '#4a5568',
                          },
                        }}>
                          <Checkbox
                            checked={formData.osint_source_ids.includes(source.id)}
                            onChange={() => handleOsintSourceChange(source.id)}
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
                        </TableCell>
                        <TableCell sx={{
                          color: 'text.secondary',
                          borderBottom: '1px solid',
                          borderColor: 'grey.300',
                          '.dark & ': {
                            color: '#a0aec0',
                            borderColor: '#4a5568',
                          },
                        }}>{source.name}</TableCell>
                        <TableCell sx={{
                          color: 'text.secondary',
                          borderBottom: '1px solid',
                          borderColor: 'grey.300',
                          '.dark & ': {
                            color: '#a0aec0',
                            borderColor: '#4a5568',
                          },
                        }}>{source.description}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={osintSources.length}
                rowsPerPage={osintSourcesRowsPerPage}
                page={osintSourcesPage}
                onPageChange={handleOsintSourcesChangePage}
                onRowsPerPageChange={handleOsintSourcesRowsPerPage}
                sx={{
                  color: 'text.primary',
                  '.dark & ': {
                    color: '#cbd5e0',
                  },
                  '& .MuiTablePagination-selectIcon': {
                    color: 'text.primary',
                    '.dark & ': {
                      color: '#cbd5e0',
                    },
                  },
                  '& .MuiTablePagination-toolbar': {
                    backgroundColor: 'background.paper',
                    '.dark & ': {
                      backgroundColor: '#2e3a47',
                    },
                  },
                  '& .MuiTablePagination-actions': {
                    color: 'text.primary',
                    '.dark & ': {
                      color: '#cbd5e0',
                    },
                  },
                }}
              />
            </TableContainer>

            <Typography variant="h6" sx={{ mt: 4, mb: 2,
              color: 'text.primary',
              '.dark & ': {
                color: '#e2e8f0',
              },
            }}>Report Item Types to share</Typography>
            <TableContainer component={Paper} sx={{ backgroundColor: 'background.paper', '&.MuiPaper-root': { backgroundColor: 'inherit', border: '1px solid', borderColor: 'grey.300' },
              '.dark & ': {
                backgroundColor: '#2e3a47',
                borderColor: '#4a5568',
              },
            }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{
                      borderBottom: '1px solid',
                      borderColor: 'grey.300',
                      '.dark & ': {
                        borderColor: '#4a5568',
                      },
                    }}></TableCell>
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportItemTypes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{
                        color: 'text.secondary',
                        borderBottom: '1px solid',
                        borderColor: 'grey.300',
                        '.dark & ': {
                          color: '#a0aec0',
                          borderColor: '#4a5568',
                        },
                      }}>No Report Item Types available</TableCell>
                    </TableRow>
                  ) : (
                    reportItemTypes.slice(reportItemTypesPage * reportItemTypesRowsPerPage, reportItemTypesPage * reportItemTypesRowsPerPage + reportItemTypesRowsPerPage).map((type) => (
                      <TableRow key={type.id} hover sx={{ cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                        '.dark & ': {
                          '&:hover': {
                            backgroundColor: '#4a5568',
                          },
                        },
                      }}>
                        <TableCell padding="checkbox" sx={{
                          borderBottom: '1px solid',
                          borderColor: 'grey.300',
                          '.dark & ': {
                            borderColor: '#4a5568',
                          },
                        }}>
                          <Checkbox
                            checked={formData.report_item_type_ids.includes(type.id)}
                            onChange={() => handleReportItemTypeChange(type.id)}
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
                        </TableCell>
                        <TableCell sx={{
                          color: 'text.secondary',
                          borderBottom: '1px solid',
                          borderColor: 'grey.300',
                          '.dark & ': {
                            color: '#a0aec0',
                            borderColor: '#4a5568',
                          },
                        }}>{type.name}</TableCell>
                        <TableCell sx={{
                          color: 'text.secondary',
                          borderBottom: '1px solid',
                          borderColor: 'grey.300',
                          '.dark & ': {
                            color: '#a0aec0',
                            borderColor: '#4a5568',
                          },
                        }}>{type.description}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={reportItemTypes.length}
                rowsPerPage={reportItemTypesRowsPerPage}
                page={reportItemTypesPage}
                onPageChange={handleReportItemTypesChangePage}
                onRowsPerPageChange={handleReportItemTypesChangeRowsPerPage}
                sx={{
                  color: 'text.primary',
                  '.dark & ': {
                    color: '#cbd5e0',
                  },
                  '& .MuiTablePagination-selectIcon': {
                    color: 'text.primary',
                    '.dark & ': {
                      color: '#cbd5e0',
                    },
                  },
                  '& .MuiTablePagination-toolbar': {
                    backgroundColor: 'background.paper',
                    '.dark & ': {
                      backgroundColor: '#2e3a47',
                    },
                  },
                  '& .MuiTablePagination-actions': {
                    color: 'text.primary',
                    '.dark & ': {
                      color: '#cbd5e0',
                    },
                  },
                }}
              />
            </TableContainer>

            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={submitting}
              sx={{ mt: 3 }}
            >
              {submitting ? 'Saving...' : 'Save Remote Access'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RemoteAccessForm; 