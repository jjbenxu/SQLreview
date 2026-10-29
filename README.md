# SQLreview

Interactive midterm review for the SQL module (Dr. R. Justin Martin, PostgreSQL).

Four units, one per lecture deck: Querying a single table, Joining tables, Shaping data, Multi-step analysis. Each has notes, an interactive lab, flashcards and a quiz. On top of that: query walkthroughs for every practice question, lecture exercise and lab question (reason it out, then reveal the query clause by clause), the twenty join-reasoning questions, a bug hunt of broken queries, the interview corner, an order-of-execution stepper, a function sheet, a glossary, a mock exam, and a playground running real PostgreSQL (PGlite) on a sample of the northgate lab database.

Plain HTML, CSS and JavaScript with no build step. The playground needs the folder served over http (it fetches data files and loads PostgreSQL from a CDN):

```bash
cd ~/Desktop/Data/sql/SQLreview && python3 -m http.server 4174
```

Then open http://localhost:4174. Everything except the playground also works by opening `index.html` directly.

`data/northgate/` holds gzipped CSVs: stores, products, calendar and exchange rates (USD-from) in full; orders and order lines as a 1-in-10 sample; customers on those orders. Regenerate from the DBeaver export with the prep script in the session scratchpad.
