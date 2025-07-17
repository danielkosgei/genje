<script>
  export let data;
  
  // Destructure the data from the server
  const { article } = data;
  
  // State for summary visibility
  let showSummary = false;
  let isGeneratingSummary = false;
  
  // Function to handle summary generation
  async function generateSummary() {
    if (article.summary) {
      // If we already have a summary, just show it
      showSummary = true;
    } else {
      // Otherwise, show loading state and potentially fetch it
      isGeneratingSummary = true;
      
      // In a real implementation, you might fetch the summary here
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      isGeneratingSummary = false;
      showSummary = true;
    }
  }
</script>

<div class="article-container">
  <header>
    <h1>{article.title}</h1>
    <div class="meta">
      {#if article.author}
        <span>By {article.author}</span> • 
      {/if}
      {#if article.published_at}
        <span>{new Date(article.published_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</span>
      {/if}
      {#if article.source}
        • <span>Source: {article.source}</span>
      {/if}
    </div>
  </header>
  
  {#if article.image_url}
    <img src={article.image_url} alt={article.title} class="article-image">
  {/if}
  
  <!-- Summary button and display -->
  <div class="summary-container">
    {#if !showSummary}
      <button 
        class="btn variant-filled-primary" 
        on:click={generateSummary}
        disabled={isGeneratingSummary}
      >
        {#if isGeneratingSummary}
          Generating Summary...
        {:else}
          Generate Summary
        {/if}
      </button>
    {:else if article.summary}
      <div class="summary">
        <h3>Summary</h3>
        <p>{article.summary}</p>
        <button 
          class="btn variant-ghost-surface btn-sm mt-2" 
          on:click={() => showSummary = false}
        >
          Hide Summary
        </button>
      </div>
    {/if}
  </div>
  
  {#if article.content}
    <div class="content">
      {@html article.content}
    </div>
  {:else}
    <div class="content-placeholder">
      <p>Full article content is loading...</p>
    </div>
  {/if}
</div>

<style>
  .article-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  .meta {
    color: #666;
    margin-bottom: 2rem;
  }
  
  .article-image {
    width: 100%;
    height: auto;
    border-radius: 8px;
    margin-bottom: 2rem;
  }
  
  .summary {
    font-size: 1.2rem;
    font-weight: 500;
    margin-bottom: 2rem;
    padding: 1rem;
    background-color: #f5f5f5;
    border-radius: 8px;
  }
  
  .content {
    line-height: 1.6;
  }
  
  .content-placeholder {
    text-align: center;
    padding: 2rem;
    background-color: #f5f5f5;
    border-radius: 8px;
  }
</style>