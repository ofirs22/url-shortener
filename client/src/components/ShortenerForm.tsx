import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const ShortenerForm = () => {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // URL Validation function
  const validateUrl = (url: string) => {
    const regex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z0-9]{2,4}(:\d+)?(\/\S*)?$/i;
    return regex.test(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Reset error on new submission
    setLoading(true); // Start loading indicator

    // Validate the entered URL
    if (!validateUrl(longUrl)) {
      setError('Please enter a valid URL.');
      setLoading(false); // Stop loading if invalid URL
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      // Make POST request to the backend to shorten the URL
      const response = await axios.post('http://localhost:3080/api/v1/urls/shorten',         {
        longUrl,
      },
      {
        headers: {
          // Add Authorization header if token exists
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

      // Assuming the API responds with the shortened URL
      setShortUrl(response.data.shortUrl);
      setLoading(false); // Stop loading
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('An error occurred while shortening the URL. Please try again.');
      setLoading(false); // Stop loading on error
    }
  };

  return (
    <div className="d-flex justify-content-center mt-5">
      <form onSubmit={handleSubmit} className="w-50">
        <div className="mb-3 row align-items-center">
          <label htmlFor="longUrl" className="col-sm-3 col-form-label">
            Enter Long URL
          </label>
          <div className="col-sm-6">
            <input
              id="longUrl"
              type="url"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="https://example.com"
              required
              className="form-control"
            />
          </div>
          <div className="col-sm-3 text-end">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Shortening...' : 'Shorten URL'}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="alert alert-danger mt-3" role="alert">
            {error}
          </div>
        )}

        {/* Display shortened URL */}
        {shortUrl && (
          <div className="alert alert-success mt-4" role="alert">
            <p className="mb-1"><strong>Short URL:</strong></p>
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none"
              style={{ fontSize: '1.25rem' }} // Increase font size
            >
              {shortUrl}
            </a>
          </div>
        )}
      </form>
    </div>
  );
};

export default ShortenerForm;
