import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-gray-300 py-4 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {currentYear} CodeReview. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;