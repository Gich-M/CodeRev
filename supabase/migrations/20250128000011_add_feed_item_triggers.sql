-- Function to handle feed item cleanup
CREATE OR REPLACE FUNCTION public.handle_feed_item_cleanup()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete feed items when code snippet is deleted
  DELETE FROM public.feed_items 
  WHERE reference_id = OLD.id 
  AND reference_type = 'code_snippet';
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger for code snippet deletion
DROP TRIGGER IF EXISTS cleanup_feed_items_on_snippet_delete ON public.code_snippets;
CREATE TRIGGER cleanup_feed_items_on_snippet_delete
  AFTER DELETE ON public.code_snippets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_feed_item_cleanup(); 