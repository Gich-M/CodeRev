import React from 'react';
import { Feed } from './Feed';

export function PendingReviews() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Pending Reviews</h1>
      <Feed 
        initialSortBy="needs_review"
        initialFilterBy="pending"
        hideFilters={true}
        showBackButton={true}
        backTo="/feed"
      />
    </div>
  );
} 