-- Function to increment review count
CREATE OR REPLACE FUNCTION increment_review_count(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    total_reviews_given = total_reviews_given + 1,
    reputation_points = reputation_points + 10,
    last_review_date = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and update review streaks
CREATE OR REPLACE FUNCTION update_review_streaks()
RETURNS void AS $$
BEGIN
  -- Update weekly streaks
  UPDATE profiles
  SET weekly_review_streak = 
    CASE 
      WHEN last_review_date >= NOW() - INTERVAL '7 days' THEN weekly_review_streak + 1
      ELSE 0
    END
  WHERE last_review_date IS NOT NULL;

  -- Add bonus points for streaks
  UPDATE profiles
  SET reputation_points = reputation_points + 
    CASE 
      WHEN weekly_review_streak = 7 THEN 50  -- Weekly streak bonus
      WHEN weekly_review_streak = 30 THEN 200  -- Monthly streak bonus
      ELSE 0
    END
  WHERE weekly_review_streak IN (7, 30);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update streaks daily
CREATE OR REPLACE FUNCTION trigger_update_streaks()
RETURNS trigger AS $$
BEGIN
  PERFORM update_review_streaks();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER daily_streak_update
  AFTER INSERT OR UPDATE OF last_review_date
  ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_streaks(); 