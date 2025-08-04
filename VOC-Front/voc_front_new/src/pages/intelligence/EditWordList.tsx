import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Checkbox, FormControlLabel, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, IconButton, TablePagination, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { fetchWordListById, fetchWordLists } from '../../utils/api';

interface Word {
  value: string;
  description: string;
}

interface Category {
  name: string;
  description: string;
  url: string;
}

interface WordListDetail {
  id: number;
  title: string;
  description: string;
  use_for_stop_words: boolean;
  categories: Category[];
  words: Word[];
}

const EditWordList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [wordList, setWordList] = useState<WordListDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [useForStopWords, setUseForStopWords] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [words, setWords] = useState<Word[]>([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const loadWordList = async () => {
      if (!id) {
        setError('Word List ID is missing.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Try fetching by ID first, if it fails, fallback to fetching all and filtering
        let data: WordListDetail | null = null;
        try {
          data = await fetchWordListById(id);
        } catch (idError) {
          console.warn(`Could not fetch word list by ID ${id}, attempting to fetch all and filter:`, idError);
          const allWordListsResponse = await fetchWordLists();
          console.log('Response from fetchWordLists (all lists):', allWordListsResponse);
          if (allWordListsResponse && Array.isArray(allWordListsResponse.items)) {
            data = allWordListsResponse.items.find((item: WordListDetail) => item.id.toString() === id);
            if (!data) {
              throw new Error('Word list not found in all lists.');
            }
          } else {
            throw new Error('Unexpected response when fetching all word lists.');
          }
        }

        if (data) {
          setWordList(data);
          setName(data.title);
          setDescription(data.description);
          setUseForStopWords(data.use_for_stop_words);
          setCategories(data.categories || []);
          setWords(data.words || []);
        } else {
          setError('Word list data is null.');
        }
      } catch (err) {
        console.error(`Failed to fetch word list ${id}:`, err);
        setError('Failed to load word list. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadWordList();
  }, [id]);

  const handleSave = () => {
    console.log('Save clicked', { name, description, useForStopWords, categories, words });
    // Implement save logic here, call updateWordList API
  };

  const handleDelete = () => {
    console.log('Delete clicked');
    // Implement delete logic here, call deleteWordList API
  };

  const handleNewCategory = () => {
    console.log('New Category clicked');
    // Implement new category logic here
  };

  const handleNewWord = () => {
    console.log('New Word clicked');
    // Implement new word logic here
  };

  const handleImportCsv = () => {
    console.log('Import from CSV clicked');
    // Implement import CSV logic here
  };

  const handleDownloadUrl = () => {
    console.log('Download from URL clicked');
    // Implement download from URL logic here
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!wordList) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No word list found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Edit Word List: {wordList.title}
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />} 
            onClick={handleSave} 
            sx={{ mr: 1 }}
          >
            Save
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<DeleteIcon />} 
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Word List Details</Typography>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={useForStopWords}
                onChange={(e) => setUseForStopWords(e.target.checked)}
              />
            }
            label="Use as stop word list"
            sx={{ mt: 2 }}
          />
        </CardContent>
      </Card>

      <Button 
        variant="contained" 
        startIcon={<AddIcon />} 
        onClick={handleNewCategory} 
        sx={{ mb: 3 }}
      >
        New Category
      </Button>

      {categories.map((category, index) => (
        <Card key={index} sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="div">
                {category.name}
              </Typography>
              <IconButton aria-label="delete category">
                <DeleteIcon />
              </IconButton>
            </Box>
            <TextField
              label="Name"
              fullWidth
              margin="normal"
              value={category.name}
              onChange={(e) => {
                const newCategories = [...categories];
                newCategories[index].name = e.target.value;
                setCategories(newCategories);
              }}
            />
            <TextField
              label="Description"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              value={category.description}
              onChange={(e) => {
                const newCategories = [...categories];
                newCategories[index].description = e.target.value;
                setCategories(newCategories);
              }}
            />
            <TextField
              label="URL"
              fullWidth
              margin="normal"
              value={category.url}
              onChange={(e) => {
                const newCategories = [...categories];
                newCategories[index].url = e.target.value;
                setCategories(newCategories);
              }}
            />
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" gutterBottom>Words</Typography>
            <Box>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={handleNewWord} 
                sx={{ mr: 1 }}
              >
                New Word
              </Button>
              <Button 
                variant="contained" 
                startIcon={<CloudUploadIcon />} 
                onClick={handleImportCsv} 
                sx={{ mr: 1 }}
              >
                Import From CSV
              </Button>
              <Button 
                variant="contained" 
                startIcon={<DownloadIcon />} 
                onClick={handleDownloadUrl}
              >
                Download From URL
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Value</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {words.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">No data available</TableCell>
                  </TableRow>
                ) : (
                  words.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((word, index) => (
                    <TableRow key={index}>
                      <TableCell>{word.value}</TableCell>
                      <TableCell>{word.description}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => console.log('Edit word', word)}>
                          <SaveIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => console.log('Delete word', word)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={words.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default EditWordList; 