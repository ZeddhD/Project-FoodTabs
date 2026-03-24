export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (time) => {
  return new Date(time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getRatingColor = (rating) => {
  if (rating >= 4.5) return '#4CAF50';
  if (rating >= 3.5) return '#8BC34A';
  if (rating >= 2.5) return '#FFC107';
  return '#F44336';
};

export const truncateText = (text, length = 100) => {
  if (text.length > length) {
    return text.substring(0, length) + '...';
  }
  return text;
};
