import { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Url {
  _id: string;
  longUrl: string;
  shortUrl: string;
  analytics: {
    clicks: number;
    lastAccessed: string | null;
  };
}

const UrlsList = () => {
  const [urls, setUrls] = useState<Url[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [editingUrl, setEditingUrl] = useState<string | null>(null); // Track which URL is being edited
  const [newLongUrl, setNewLongUrl] = useState<string>(''); // Store the new long URL
  const [urlError, setUrlError] = useState<string>(''); // Error message for invalid URL

  const userId = localStorage.getItem("userId");

  // Function to delete a URL
  const handleDelete = async (shortUrl: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Make DELETE request to the backend
      const response = await axios.delete(
        `http://localhost:3080/api/v1/urls/deleteurl/${userId}/${shortUrl}`, 
        {
          headers: {
            "authorization": `Bearer ${token}`
          },
        }
      );
      console.log(response.data)
      // Remove the deleted URL from the state (UI)
      setUrls(urls.filter(url => url.shortUrl !== shortUrl));

      alert('URL deleted successfully!');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to delete the URL. Please try again.');
    }
  };

  // Function to handle updating the long URL
  const handleUpdate = async (shortUrl: string) => {
    if (!isValidUrl(newLongUrl)) {
      setUrlError('Please enter a valid URL.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');

      // Make PUT request to update the long URL with the correct route and body
      const response = await axios.put(
        `http://localhost:3080/api/v1/urls/updatelongurl/${userId}`,
        { shortUrl, newLongUrl },
        {
          headers: {
            "authorization": `Bearer ${token}`
          },
        }
      );
      console.log(response.data)
      // Update the URLs list with the new long URL
      setUrls(urls.map((url) => 
        url.shortUrl === shortUrl ? { ...url, longUrl: newLongUrl } : url
      ));

      setEditingUrl(null); // Close the edit mode
      setNewLongUrl(''); // Clear the input
      alert('URL updated successfully!');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to update the URL. Please try again.');
    }
  };

  // URL validation function
  const isValidUrl = (url: string) => {
    const pattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\/[^\s]*)?$/;
    return pattern.test(url);
  };

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        const response = await axios.get(
          `http://localhost:3080/api/v1/urls/getuserurls/${userId}`, {
            headers: {
              "authorization": `Bearer ${token}`
            },
          }
        );
        setUrls(response.data.urls); // Assuming the response contains an array of URLs
        setLoading(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError('Failed to fetch URLs. Please try again.');
        setLoading(false);
      }
    };

    if (userId) {
      fetchUrls();
    } else {
      setError('User ID not found. Please log in.');
      setLoading(false);
    }
  }, [userId]);

  if (loading) return <div className="text-center">Loading...</div>;

  return (
    <div className="container mt-5">
      <h2>Your Shortened URLs</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <ul className="list-group">
        {urls.length > 0 ? (
          urls.map((url) => (
            <li key={url._id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <p>
                  <strong>Long URL:</strong>{' '}
                  {editingUrl === url.shortUrl ? (
                    <div>
                      <input
                        type="url"
                        className="form-control"
                        value={newLongUrl}
                        onChange={(e) => setNewLongUrl(e.target.value)}
                        placeholder="Enter new long URL"
                      />
                      {urlError && <div className="alert alert-danger mt-2">{urlError}</div>}
                    </div>
                  ) : (
                    <a href={url.longUrl} target="_blank" rel="noopener noreferrer">{url.longUrl}</a>
                  )}
                </p>
                <p>
                  <strong>Short URL:</strong>{' '}
                  <a href={`http://localhost:3080/${url.shortUrl}`} target="_blank" rel="noopener noreferrer">{`http://localhost:3080/${url.shortUrl}`}</a>
                </p>
                <p>
                  <strong>Clicks:</strong> {url.analytics.clicks}
                </p>
                <p>
                  <strong>Last Accessed:</strong> {url.analytics.lastAccessed || 'Never'}
                </p>
              </div>
              <div>
                {editingUrl === url.shortUrl ? (
                  <button 
                    className="btn btn-success me-2"
                    onClick={() => handleUpdate(url.shortUrl)}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="btn btn-warning me-2"
                    onClick={() => {
                      setEditingUrl(url.shortUrl); 
                      setNewLongUrl(url.longUrl); // Pre-fill the input field with the current URL
                      setUrlError(''); // Clear any previous error
                    }}
                  >
                    Update
                  </button>
                )}
                <button className="btn btn-danger" onClick={() => handleDelete(url.shortUrl)}>
                  Delete
                </button>
              </div>
            </li>
          ))
        ) : (
          <li className="list-group-item">No URLs found</li>
        )}
      </ul>
    </div>
  );
};

export default UrlsList;
