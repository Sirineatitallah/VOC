import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, CircularProgress, Alert, Card, CardContent } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { fetchBotNodes, createBotNode, updateBotNode } from '../../utils/api';

interface BotNodeFormFields {
  title: string;
  description: string;
  url: string;
}

interface BotNode {
  id: string;
  title: string;
  description: string;
  url: string;
}

const BotNodeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BotNodeFormFields>({
    title: '',
    description: '',
    url: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBotNode = async () => {
      setLoading(true);
      setError(null);
      try {
        if (id) {
          const allNodes = await fetchBotNodes();
          const nodeData = allNodes.items ? allNodes.items.find((node: BotNode) => node.id === id) : allNodes.find((node: BotNode) => node.id === id);
          if (nodeData) {
            setFormData({
              title: nodeData.title || '',
              description: nodeData.description || '',
              url: nodeData.url || '',
            });
          } else {
            setError('Bot Node not found.');
          }
        }
      } catch (err) {
        console.error('Error loading bot node data:', err);
        setError('Failed to load bot node data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadBotNode();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (id) {
        await updateBotNode(id, formData);
        console.log('Bot Node updated successfully!');
      } else {
        await createBotNode(formData);
        console.log('Bot Node created successfully!');
      }
      navigate('/intelligence/bots-nodes');
    } catch (err) {
      console.error('Error saving bot node:', err);
      setError('Failed to save bot node. Please try again.');
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
      <Typography variant="h4" gutterBottom>
        {id ? 'Edit Bot Node' : 'Add New Bot Node'}
      </Typography>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Title"
              name="title"
              fullWidth
              margin="normal"
              value={formData.title}
              onChange={handleChange}
              required
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
            />
            <TextField
              label="URL"
              name="url"
              fullWidth
              margin="normal"
              value={formData.url}
              onChange={handleChange}
              required
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

export default BotNodeForm; 