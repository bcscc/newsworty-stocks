# Newsworty Stocks

This website displays current news stories from the New York Times, categorized by different topics, such as business, science, technology, and world events. It also provides relevant stock information for companies mentioned in the news articles, including their stock ticker symbol and daily percentage change. This allows users to connect news stories with related stock market data.

## Third-Party APIs Used
1. **New York Times API**: This API is used to fetch the top stories from different news categories. It retrieves information such as article titles, abstracts, and multimedia content to display a short preview card of the article.
   - Endpoint: `https://api.nytimes.com/svc/topstories/v2/{TOPIC}.json?api-key={NYT_KEY}`
   - Insert your [New York Times API Key](https://developer.nytimes.com/apis) into the variable `NYT_KEY`
   
2. **Financial Modeling Prep (FMP) API**: This API is used to fetch company stock data, including stock ticker symbols and stock price quotes. 
   - `https://financialmodelingprep.com/api/v3/search?query={COMPANY}&apikey={FMP_KEY}`: Retrieves stock ticker symbols from company name.
   - `https://financialmodelingprep.com/api/v3/quote/{TICKER}?apikey={FMP_KEY}`: Retrieves the stock quotes based on the ticker symbols.
   - Insert your [Financial Modeling Prep API Key](https://site.financialmodelingprep.com/) into the variable `FMP_KEY`
   
## How to Use
- The user selects a news category from the dropdown menu and clicks the "Submit" button to fetch the latest news stories.
- The application uses the New York Times API to fetch the top stories for the selected category.
- It processes the fetched stories to extract company names, which are then used to retrieve stock information from the Financial Modeling Prep API.
- The stock data is displayed in a scrolling ticker on the application page, and the news stories are shown below with additional information, such as article titles, abstracts, company-related keywords, and stock changes.

## Notes
- If the Financial Modeling Prep API runs out of API calls, the application uses placeholder data to populate the stock information. 