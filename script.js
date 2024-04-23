const NYT_BASE_URL = 'https://api.nytimes.com/svc/topstories/v2/';
const FMP_SEARCH_URL = 'https://financialmodelingprep.com/api/v3/search?query='
const FMP_QUOTE_URL = 'https://financialmodelingprep.com/api/v3/quote/'
const NYT_KEY = '';
const FMP_KEY = '';

const searchTerm = document.querySelector('.search');
const startDate = document.querySelector('.start-date');
const endDate = document.querySelector('.end-date');
const searchForm = document.querySelector('form');
const nextBtn = document.querySelector('.next');
const previousBtn = document.querySelector('.prev');
const section = document.querySelector('section');
const tickers = document.querySelector('.ticker-content');

const selectTerm = document.querySelector('.select');

function fetchNYTStories(topic) {
    return fetch(`${NYT_BASE_URL}${topic}.json?api-key=${NYT_KEY}`)
        .then(response => response.json());
}

function fetchCompanyTicker(company) {
    return fetch(`${FMP_SEARCH_URL}${company}&apikey=${FMP_KEY}`)
        .then(response => response.json());
}

function fetchCompanyQuote(symbol) {
    return fetch(`${FMP_QUOTE_URL}${symbol}?apikey=${FMP_KEY}`)
        .then(response => response.json());
}

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const topic = selectTerm.value;

    const articles = [];
    const uniqueCompanies = new Map();

    fetchNYTStories(topic)
        .then((json) => {
            json.results.forEach((article) => {
                if (article.org_facet.length > 0 && articles.length <= 5) {
                    let item = {
                        Url: article.url,
                        Title: article.title,
                        Abstract: article.abstract,
                        Img: article.multimedia ? article.multimedia[0].url : null,
                        Keywords: article.org_facet ? article.org_facet : [],
                        Ticker: null,
                        Stock: null
                    };
                    articles.push(item);
                }
            });
        })
        .then(() => {
            let promises = articles.reduce((acc, article, index) => {
                if (article.Keywords.length > 0) {
                    article.Keywords.forEach(company => {
                        // acc.push(processCompany(company, article));
                    });
                }
                return acc;
            }, []);

            Promise.all(promises).then(() => {
                articles.forEach((article) => {
                    article.Keywords.forEach((company) => {
                        if (article.Stock) {
                            uniqueCompanies.set(company, { ticker: article.Stock.symbol, changesPercentage: article.Stock.changesPercentage });
                        }
                    })
                })
                // console.log(articles);
                // console.log(uniqueCompanies);
                if (uniqueCompanies.size < 1) {
                    // fill ticker slider with placeholder info if FMP API runs out of API calls
                    fillPlaceHolderStocks(uniqueCompanies);
                }
                displayResults(articles, uniqueCompanies);
            });
        })
        .catch((error) => console.error(`Error fetching data: ${error.message}`));
});

function processCompany(company, article) {
    return fetchCompanyTicker(company)
        .then(json => {
            if (json.length > 0) {
                ticker = json[0].symbol;
                                
                for (const stock of json) {
                    if (stock.exchangeShortName === "NASDAQ" || stock.exchangeShortName === "NYSE") {
                        ticker = stock.symbol;
                    }
                }
                article.Ticker = ticker
                return fetchCompanyQuote(ticker);
            }
        })
        .then(quoteJson => {
            if (quoteJson) {
                console.log(quoteJson[0]);
                article.Stock = quoteJson[0];
            }
        });
}

function displayResults(articles, uniqueCompanies) {
    tickers.innerHTML = ``;
    section.innerHTML = ``;

    if (articles.length === 0) {
        const para = document.createElement("p");
        para.textContent = "No results returned.";
        section.appendChild(para);
    } else {
        for (const current of articles) {
            if (current.Keywords.length > 0) {
                const article = document.createElement("article");
                const text = document.createElement("div");
                const heading = document.createElement("h2");
                const link = document.createElement("a");
                const img = document.createElement("img");
                const para1 = document.createElement("p");
                const keywordPara = document.createElement("div");
                keywordPara.classList.add("keywords");
                text.classList.add("content");
    
    
                link.href = current.Url;
                link.textContent = current.Title;
                para1.textContent = current.Abstract;


                keywordPara.textContent = "Companies: ";
                for (const company of current.Keywords) {
                    const div = document.createElement("div");
                    div.classList.add('tag');
                    div.textContent = `${company} `;

                    keywordPara.appendChild(div);


                    if (uniqueCompanies.has(company)) {
                        const companyInfo = uniqueCompanies.get(company);
                        const companyDiv = document.createElement("span");
                        companyDiv.textContent = ` ${companyInfo.ticker} `;
                        const percentChange = companyInfo.changesPercentage;
                        if (percentChange >= 0) {
                            companyDiv.textContent += `▲ ${Math.round(percentChange * 100) / 100}%`
                            companyDiv.classList.add("color-green");
                        } else if (percentChange < 0) {
                            companyDiv.textContent += `▼ ${Math.round(percentChange * 100) / 100}%`
                            companyDiv.classList.add("color-red");
                        }
                        div.appendChild(companyDiv);
                    }

                    
                }

                if (current.Img) {
                    img.src = `${current.Img}`;
                    img.alt = current.Title;
                }

                text.appendChild(heading);
                heading.appendChild(link);
                text.appendChild(para1);
                text.appendChild(keywordPara);
                article.appendChild(text);
                img.setAttribute('loading', 'lazy');
                article.appendChild(img);
                section.appendChild(article);
            }
        }
        displayTickers(uniqueCompanies);
        stockSlider();
    }
}

function displayTickers(uniqueCompanies) {
    uniqueCompanies.forEach((value, company) => {
        const div = document.createElement("div");
        div.classList.add('tag');
        // Construct text content with company name and changes percentage
        div.textContent = `${company}`;
        const stock = document.createElement("div");
        if (value.changesPercentage >= 0) {
            stock.textContent = `${value.ticker} ▲ ${Math.round(value.changesPercentage * 100) / 100}%`;
            stock.classList.add("color-green");
        } else {
            stock.textContent = `${value.ticker} ▼ ${Math.round(value.changesPercentage * 100) / 100}%`;
            stock.classList.add("color-red");
        }
        div.appendChild(stock);
        tickers.appendChild(div);
    });
}


function stockSlider() {
    const tickerContent = document.querySelector('.ticker-content');
    const tickerContainer = document.querySelector('.ticker-container');
    let totalWidth = 0;

    tickerContent.childNodes.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
            const style = window.getComputedStyle(child);
            totalWidth += child.offsetWidth + parseInt(style.marginLeft, 10) + parseInt(style.marginRight, 10);
        }
    });

    const containerWidth = tickerContainer.offsetWidth;

    const startPercent = 100;
    const endPercent = -((totalWidth / containerWidth) * 100);

    const speed = totalWidth / 100; // Adjust constant for speed

    updateTickerAnimation(speed, startPercent, endPercent);
}

function updateTickerAnimation(speed, startPercent, endPercent) {
    const existingStyle = document.getElementById('ticker-animation-style');
    if (existingStyle) {
      existingStyle.remove();
    }
  
    const styleSheet = document.createElement('style');
    styleSheet.id = 'ticker-animation-style';
    styleSheet.innerHTML = `
      @keyframes ticker {
        from { transform: translateX(${startPercent}%); }
        to { transform: translateX(${endPercent}%); }
      }
      .ticker-content {
        animation: ticker ${speed}s linear infinite;
      }
    `;
    document.head.appendChild(styleSheet);
  }


// function to fill ticker slider with placeholder information if FMP ran out of API calls to populate stock data
function fillPlaceHolderStocks(uniqueCompanies) {
    uniqueCompanies.set("Apple Inc", { ticker: "AAPL", changesPercentage: 0.1 });
    uniqueCompanies.set("Tesla Inc", { ticker: "TSLA", changesPercentage: -0.2 });
    uniqueCompanies.set("Microsoft Corp", { ticker: "MSFT", changesPercentage: 0.3 });
    uniqueCompanies.set("Meta Platform Inc", { ticker: "META", changesPercentage: 0.4 });
    uniqueCompanies.set("Google Inc", { ticker: "GOOG", changesPercentage: 0.5 });
}