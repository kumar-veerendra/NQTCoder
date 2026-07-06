<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title>Sitemap | NQTCoder</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&amp;family=JetBrains+Mono:wght@400;700&amp;display=swap" rel="stylesheet" />
        <style type="text/css">
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Outfit', sans-serif;
            background-color: #0b0f19;
            color: #f9fafb;
            min-height: 100vh;
            padding: 2.5rem 1.5rem;
            display: flex;
            justify-content: center;
          }
          .container {
            width: 100%;
            max-width: 1000px;
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }
          header {
            background: #111827;
            border: 1px solid #1f2937;
            border-radius: 12px;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
          }
          .header-main {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1rem;
          }
          .title-area {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
          .title-area h1 {
            font-size: 1.75rem;
            font-weight: 800;
            letter-spacing: -0.025em;
          }
          .title-area h1 span {
            color: #6366f1;
          }
          .subtitle {
            color: #9ca3af;
            font-size: 0.875rem;
            line-height: 1.5;
            max-width: 600px;
          }
          .badge {
            background: rgba(99, 102, 241, 0.15);
            color: #818cf8;
            border: 1px solid rgba(99, 102, 241, 0.3);
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .search-bar {
            position: relative;
            width: 100%;
          }
          .search-input {
            width: 100%;
            background-color: #0b0f19;
            border: 1px solid #1f2937;
            border-radius: 8px;
            color: #f9fafb;
            padding: 0.75rem 1rem;
            font-family: inherit;
            font-size: 0.95rem;
            outline: none;
            transition: all 0.2s ease-in-out;
          }
          .search-input:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
          }
          .search-input::placeholder {
            color: #4b5563;
          }
          .stats-panel {
            display: flex;
            gap: 1.5rem;
            font-size: 0.85rem;
            color: #9ca3af;
            font-weight: 600;
          }
          .stat-item span {
            color: #f9fafb;
            font-weight: 700;
          }
          .table-container {
            background: #111827;
            border: 1px solid #1f2937;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
          }
          table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
          }
          th {
            background-color: #1f2937;
            color: #9ca3af;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 1rem 1.25rem;
            border-bottom: 1px solid #1f2937;
          }
          td {
            padding: 1rem 1.25rem;
            border-bottom: 1px solid #1f2937;
            font-size: 0.9rem;
            color: #d1d5db;
          }
          tr:last-child td {
            border-bottom: none;
          }
          tr {
            transition: background-color 0.15s ease;
          }
          tr:hover {
            background-color: rgba(99, 102, 241, 0.04);
          }
          .route-link {
            color: #818cf8;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.15s ease;
            word-break: break-all;
          }
          .route-link:hover {
            color: #a5b4fc;
            text-decoration: underline;
          }
          .freq-badge {
            background-color: rgba(75, 85, 99, 0.3);
            color: #9ca3af;
            font-size: 0.75rem;
            padding: 0.15rem 0.5rem;
            border-radius: 4px;
            font-weight: 600;
            display: inline-block;
          }
          .priority-bar-bg {
            background-color: #1f2937;
            width: 60px;
            height: 6px;
            border-radius: 9999px;
            display: inline-block;
            vertical-align: middle;
            margin-right: 0.5rem;
            overflow: hidden;
          }
          .priority-bar-fg {
            background: linear-gradient(90deg, #6366f1, #38bdf8);
            height: 100%;
            border-radius: 9999px;
          }
          .priority-value {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8rem;
            font-weight: 700;
            vertical-align: middle;
          }
          .date-val {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8rem;
          }
          footer {
            text-align: center;
            color: #4b5563;
            font-size: 0.75rem;
            margin-top: 1rem;
            font-weight: 500;
          }
        </style>
        <script type="text/javascript">
          // <![CDATA[
          function filterRoutes() {
            var input = document.getElementById("search-input");
            var filter = input.value.toLowerCase();
            var table = document.getElementById("sitemap-table");
            var tr = table.getElementsByTagName("tr");
            var visibleCount = 0;
            
            for (var i = 1; i < tr.length; i++) {
              var td = tr[i].getElementsByTagName("td")[0];
              if (td) {
                var textValue = td.textContent || td.innerText;
                if (textValue.toLowerCase().indexOf(filter) > -1) {
                  tr[i].style.display = "";
                  visibleCount++;
                } else {
                  tr[i].style.display = "none";
                }
              }
            }
            document.getElementById("visible-count").innerText = visibleCount;
          }
          // ]]>
        </script>
      </head>
      <body>
        <div class="container">
          <header>
            <div class="header-main">
              <div class="title-area">
                <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="50,8 88,30 88,70 50,92 12,70 12,30" fill="none" stroke="#6366F1" stroke-width="8" stroke-linejoin="round" />
                  <path d="M35,38 L24,50 L35,62 M65,38 L76,50 L65,62 M55,32 L45,68" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <h1>NQT<span>Coder</span></h1>
              </div>
              <span class="badge">XML Sitemap</span>
            </div>
            <p class="subtitle">
              This is the XML Sitemap for NQTCoder, structured to facilitate indexing by search engines. The styled layout below assists human review of public pages and site routing.
            </p>
            <div class="search-bar">
              <input type="text" id="search-input" class="search-input" onkeyup="filterRoutes()" placeholder="Search routes (e.g. practice, leaderboard)..." />
            </div>
            <div class="stats-panel">
              <div class="stat-item">Total Pages: <span id="total-count"><xsl:value-of select="count(s:urlset/s:url)"/></span></div>
              <div class="stat-item">Matching Search: <span id="visible-count"><xsl:value-of select="count(s:urlset/s:url)"/></span></div>
            </div>
          </header>

          <div class="table-container">
            <table id="sitemap-table">
              <thead>
                <tr>
                  <th>Route URL</th>
                  <th>Change Freq</th>
                  <th>Priority</th>
                  <th>Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="s:urlset/s:url">
                  <xsl:sort select="s:priority" data-type="number" order="descending"/>
                  <tr>
                    <td>
                      <a class="route-link" href="{s:loc}">
                        <xsl:value-of select="s:loc"/>
                      </a>
                    </td>
                    <td>
                      <span class="freq-badge">
                        <xsl:value-of select="s:changefreq"/>
                      </span>
                    </td>
                    <td>
                      <div class="priority-bar-bg" title="Priority: {s:priority}">
                        <div class="priority-bar-fg" style="width: {s:priority * 100}%"></div>
                      </div>
                      <span class="priority-value"><xsl:value-of select="s:priority"/></span>
                    </td>
                    <td>
                      <span class="date-val">
                        <xsl:value-of select="s:lastmod"/>
                      </span>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>

          <footer>
            Generated on 2026-07-07 | NQTCoder Team
          </footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
