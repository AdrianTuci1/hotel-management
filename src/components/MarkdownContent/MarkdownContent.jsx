import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import styles from './MarkdownContent.module.css';

function MarkdownContent({ filePath }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        setLoading(true);
        const response = await fetch(filePath);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch markdown: ${response.status}`);
        }
        
        const text = await response.text();
        setContent(text);
        setError(null);
      } catch (err) {
        console.error('Error fetching markdown:', err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchMarkdown();
  }, [filePath]);

  if (loading) {
    return <div className={styles.loading}>Se încarcă...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  // Componente personalizate pentru a stiliza markdown-ul
  const components = {
    h1: ({node, ...props}) => <h1 className={styles.heading1} {...props} />,
    h2: ({node, ...props}) => <h2 className={styles.heading2} {...props} />,
    p: ({node, ...props}) => <p className={styles.paragraph} {...props} />
  };

  return (
    <div className={styles.markdownContainer}>
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}

MarkdownContent.propTypes = {
  filePath: PropTypes.string.isRequired
};

export default MarkdownContent; 