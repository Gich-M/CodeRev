#!/bin/bash

# Add all untracked files
git add .

# Function to perform remaining commits
perform_remaining_commits() {
    # 14. Auth Input Refactor
    git add src/components/AuthInput.tsx src/constants/auth.ts
    git commit -m "Refactor authentication input component"

    # 15. Feed Improvements
    git add src/pages/Feed.tsx src/types/feed.ts
    git commit -m "Update feed interaction types and logic"

    # 16. Profile Page Enhancement
    git add src/pages/Profile.tsx src/hooks/useAuth.ts
    git commit -m "Enhance user profile page functionality"

    # 17. Reputation System Refinement
    git add src/lib/reputationSystem.ts src/hooks/useReviewStats.ts
    git commit -m "Improve reputation system calculation methods"

    # 18. Dashboard State Management
    git add src/pages/Dashboard.tsx src/hooks/useReviewStats.ts
    git commit -m "Refactor dashboard state management"

    # 19. Error Handling
    git add src/hooks/useAuth.ts src/components/AuthInput.tsx
    git commit -m "Add additional error handling for authentication"

    # 20. Performance Optimization
    git add src/pages/Feed.tsx src/components/FeedItem.tsx
    git commit -m "Optimize feed rendering and performance"

    # 21. Final Refinements
    git add tailwind.config.js postcss.config.js src/App.tsx
    git commit -m "Final project structure and configuration refinements"
}

# Execute remaining commits
perform_remaining_commits