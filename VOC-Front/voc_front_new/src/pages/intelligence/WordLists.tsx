import React, { useState, useEffect, useCallback } from 'react';
import { fetchWordLists } from '../../utils/api';
import { Card, CardContent, Typography, TextField, CircularProgress, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';

interface WordList {
  id: number;
  title: string;
  description: string;
  use_for_stop_words: boolean;
}

const WordLists: React.FC = () => {
  const [wordLists, setWordLists] = useState<WordList[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigate = useNavigate();

  const loadWordLists = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWordLists(query);
      if (data && Array.isArray(data.items)) {
        setWordLists(data.items);
        setTotalCount(data.total_count || 0);
      } else {
        setWordLists([]);
        setTotalCount(0);
        setError('Unexpected API response format.');
      }
    } catch (err) {
      console.error('Failed to fetch word lists:', err);
      setError('Failed to load word lists. Please try again later.');
      setWordLists([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWordLists(searchQuery);
  }, [loadWordLists, searchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleCardClick = (id: number) => {
    navigate(`/intelligence/word-lists/${id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Word Lists
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        Word lists count: {totalCount}
      </Typography>

      <TextField
        label="Search Word Lists"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={handleSearchChange}
        InputProps={{
          endAdornment: <SearchIcon />,
        }}
        sx={{ mb: 3 }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box>
          {wordLists.length === 0 ? (
            <Typography>No word lists found.</Typography>
          ) : (
            wordLists.map((wordList) => (
              <Card
                key={wordList.id}
                sx={{ mb: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                onClick={() => handleCardClick(wordList.id)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="div">
                      {wordList.title}
                    </Typography>
                    {wordList.use_for_stop_words && (
                      <Chip label="Stop list" color="success" size="small" />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {wordList.description}
                  </Typography>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}
    </Box>
  );
};

export default WordLists; 