/* Course content. Written from Dr. R. Justin Martin's four lecture decks (Querying a Single Table, Joining Tables, Shaping Data, Multi-Step Analysis). */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const KW = /\b(SELECT|FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|LEFT JOIN|INNER JOIN|RIGHT JOIN|FULL JOIN|JOIN|ON|AND|OR|NOT|IN|BETWEEN|LIKE|ILIKE|IS|NULL|AS|DISTINCT|CASE|WHEN|THEN|ELSE|END|WITH|OVER|PARTITION BY|ROWS BETWEEN|UNBOUNDED PRECEDING|CURRENT ROW|UNBOUNDED FOLLOWING|PRECEDING|FOLLOWING|DESC|ASC|NULLS FIRST|NULLS LAST|DATE|INTERVAL|TIMESTAMPTZ|SET TIME ZONE|EXISTS|UNION ALL|UNION)\b/g;
const hi = s => esc(s).replace(/(--[^\n]*)|('[^']*')|(\b(?:SELECT|FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|LEFT JOIN|INNER JOIN|RIGHT JOIN|FULL JOIN|JOIN|ON|AND|OR|NOT|IN|BETWEEN|LIKE|ILIKE|IS|NULL|AS|DISTINCT|CASE|WHEN|THEN|ELSE|END|WITH|OVER|PARTITION BY|ROWS BETWEEN|UNBOUNDED PRECEDING|CURRENT ROW|UNBOUNDED FOLLOWING|PRECEDING|FOLLOWING|DESC|ASC|NULLS FIRST|NULLS LAST|DATE|INTERVAL|TIMESTAMPTZ|SET TIME ZONE|EXISTS|UNION ALL|UNION)\b)/g, (m, c, s, k) => c ? `<span class="cm">${c}</span>` : s ? `<span class="st">${s}</span>` : `<span class="kw">${k}</span>`);
const SQL = (s, cls = '') => `<pre class="sql ${cls}">${hi(s.trim())}</pre>`;
/* Small result table: RES([cols], [[row], ...], caption) */
const RES = (cols, rows, cap) => `<div class="tw"><table class="res">${cap ? `<caption>${cap}</caption>` : ''}<tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(v => v === null ? '<td class="null">NULL</td>' : `<td>${v}</td>`).join('')}</tr>`).join('')}</table></div>`;
const TF = ['True', 'False'];

const UNITS = [
/* ------------------------------------------------------------------ 1 */
{
  id: 'single', title: 'Querying a single table', deck: 'Deck 1 · Select, filter, sort and summarize',
  lede: 'Every query answers four questions: which rows, which columns, grouped how, and sorted how. Learn to hear them in a business question and the SQL writes itself.',
  secs: [
    { h: 'Anatomy of a query', b: `
      ${SQL(`SELECT    product_name, unit_price        -- which columns
FROM      lecture.products                -- which table
WHERE     category = 'Bakery'             -- which rows
ORDER BY  unit_price DESC                 -- sorted how
LIMIT     3;                              -- how many`)}
      <ul>
        <li>Clauses are <b>written in this order, always</b>. Only SELECT and FROM are required.</li>
        <li><code>lecture.products</code> is <b>schema.table</b>. An unqualified name goes to <code>public</code>.</li>
        <li>One statement ends with a semicolon. Keywords are not case-sensitive; UPPER case is a convention for the reader.</li>
        <li>A query <b>does not change the data</b>. It sends a question and gets a table back.</li>
      </ul>
      <p class="trap"><b>Why learn it when AI can write it</b>A wrong filter or a missed NULL runs cleanly and returns a believable number. You can only catch it if you could have written it yourself. No AI on the exam.</p>` },
    { h: 'Choosing columns: SELECT, aliases, DISTINCT', b: `
      <p>List the columns you want, separated by commas, in the order you want them. <code>SELECT *</code> returns every column: fine for a first look, but name the columns in anything you keep.</p>
      ${SQL(`SELECT  product_name, unit_price,
        ROUND(unit_price * 1.10, 2) AS new_price
FROM    lecture.products
WHERE   category = 'Bakery';`)}
      <ul>
        <li><b>Arithmetic</b> works on columns (<code>+ - * /</code>), computed row by row.</li>
        <li><code>ROUND(value, 2)</code> rounds to 2 decimals; leave out the places and it rounds to a whole number.</li>
        <li><code>AS new_price</code> names the result column: an <b>alias</b>. Without one the column is called <code>round</code>. Nothing is stored; the alias exists only in this result.</li>
        <li><code>SELECT DISTINCT region</code> removes duplicate rows from the result. With two columns, <code>DISTINCT region, customer_id</code> is the distinct <b>pairs</b>, not distinct regions.</li>
      </ul>` },
    { h: 'Filtering rows: WHERE and its shortcuts', b: `
      <div class="tw"><table><tr><th>Operator</th><th>Means</th><th>Example</th></tr>
        <tr><td><code>=</code> <code>&lt;&gt;</code></td><td>equal, not equal</td><td><code>region = 'West'</code>, <code>region &lt;&gt; 'West'</code></td></tr>
        <tr><td><code>&lt; &lt;= &gt; &gt;=</code></td><td>comparison</td><td><code>order_date &gt;= '2026-03-01'</code></td></tr>
        <tr><td><code>IN (…)</code></td><td>matches any value in the list; shorthand for a chain of ORs</td><td><code>category IN ('Merchandise', 'Packaged Goods')</code></td></tr>
        <tr><td><code>BETWEEN low AND high</code></td><td>in the range, <b>both ends included</b>; same as <code>&gt;= low AND &lt;= high</code></td><td><code>unit_price BETWEEN 10 AND 20</code></td></tr>
        <tr><td><code>LIKE</code> / <code>ILIKE</code></td><td>pattern match; <code>%</code> any run of characters, <code>_</code> exactly one; ILIKE ignores case</td><td><code>product_name LIKE '%12oz'</code></td></tr>
        <tr><td><code>IS NULL</code> / <code>IS NOT NULL</code></td><td>the only way to test for a missing value</td><td><code>employee_id IS NULL</code></td></tr>
      </table></div>
      <ul>
        <li>Text and dates go in <b>single quotes</b>. Text comparison is <b>case-sensitive</b>: <code>'west'</code> matches nothing when the data says West. Reelhouse stores titles and names in CAPITALS, so <code>LIKE '%love%'</code> returns nothing and <code>ILIKE '%love%'</code> works.</li>
        <li>Write the low value first: <code>BETWEEN 20 AND 10</code> returns nothing. BETWEEN works on numbers, dates and text; <code>NOT BETWEEN</code>, <code>NOT IN</code>, <code>NOT LIKE</code> all exist.</li>
        <li><code>'%1_oz'</code> catches Latte 16oz as well as the 12oz products, because <code>_</code> matched the 6.</li>
      </ul>
      <p class="trap"><b>The trap: AND before OR</b>Wanted: Bakery or Beverage products over $4. <code>WHERE category = 'Bakery' OR category = 'Beverages' AND unit_price &gt; 4</code> is read as <code>Bakery OR (Beverages AND &gt; 4)</code>, so the $3.50 muffin is in. AND is evaluated before OR, the way × is before +. Both versions run and return a believable list. <b>Rule: whenever a WHERE mixes AND and OR, write the parentheses yourself</b>, or use IN.</p>` },
    { h: 'Nothing equals NULL', b: `
      <p>NULL means <b>no value</b>: not zero, not an empty string. Blue Line leaves <code>employee_id</code> empty on orders nobody rang up (Mobile App, Drive-thru).</p>
      <div class="two">${SQL(`-- 0 rows. Always.
SELECT COUNT(*) FROM orders
WHERE  employee_id = NULL;`, 'bad')}${SQL(`-- 86,498 rows
SELECT COUNT(*) FROM orders
WHERE  employee_id IS NULL;`)}</div>
      <ul>
        <li>Any comparison with NULL (<code>=</code>, <code>&lt;&gt;</code>, <code>&gt;</code>) is <b>unknown</b>, not true. WHERE keeps only true. So <code>= NULL</code> keeps nothing, and no error tells you.</li>
        <li><code>employee_id &lt;&gt; 5</code> silently drops the NULL rows too.</li>
        <li>An <b>empty string <code>''</code> is a value, not a NULL</b>. <code>COUNT(address2)</code> counts it; 999 of 1,003 reelhouse addresses store <code>''</code> in address2 and none says anything. Use <code>NULLIF(address2, '')</code> to turn it into a real NULL.</li>
      </ul>` },
    { h: 'Sorting and limiting', b: `
      ${SQL(`SELECT   product_name, unit_price
FROM     lecture.products
ORDER BY unit_price DESC
LIMIT    3;   -- "the three most expensive products"`)}
      <ul>
        <li><code>ASC</code> is the default; <code>DESC</code> reverses. Sort on several columns: <code>ORDER BY category, unit_price DESC</code>. The second column is the <b>tie-breaker</b>; every exam sort includes one so there is exactly one correct order.</li>
        <li><b>Without ORDER BY, row order is not guaranteed</b>: not insertion order, not key order. <code>LIMIT</code> without <code>ORDER BY</code> returns <i>some</i> rows, not the top rows.</li>
        <li>ORDER BY <b>can use an alias</b> (<code>ORDER BY rate_per_day DESC</code>), because it runs after SELECT. WHERE and HAVING cannot.</li>
        <li>A column's type decides how it sorts: reelhouse <code>rating</code> is a special type that sorts G, PG, PG-13, R, NC-17, not alphabetically. Dates sort by calendar only if they are dates, not text.</li>
      </ul>` },
    { h: 'Aggregates: many rows in, one row out', b: `
      ${SQL(`SELECT  COUNT(*)                  AS products,
        MIN(unit_price)           AS smallest,
        MAX(unit_price)           AS largest,
        ROUND(AVG(unit_price), 2) AS avg_price
FROM    lecture.products;`)}
      ${RES(['products', 'smallest', 'largest', 'avg_price'], [[16, '3.00', '28.00', '10.43']], '1 row')}
      <ul>
        <li><code>COUNT, SUM, AVG, MIN, MAX</code> collapse many rows into one value. Add a WHERE and they summarize only the rows it keeps.</li>
        <li><b>Aggregates skip NULLs.</b> Over 10, NULL and 20: SUM is 30 and <b>AVG is 15</b>, divided by the 2 values present, not by 3 rows. If the missing value really meant zero, the right average is 10, and you have to say so with COALESCE.</li>
      </ul>
      <div class="tw"><table><tr><th>Count</th><th>Counts</th><th>On orders</th></tr>
        <tr><td><code>COUNT(*)</code></td><td>rows</td><td>751,009</td></tr>
        <tr><td><code>COUNT(col)</code></td><td>rows where <code>col</code> is not NULL</td><td>664,511</td></tr>
        <tr><td><code>COUNT(DISTINCT col)</code></td><td>different non-NULL values of <code>col</code></td><td>116</td></tr>
      </table></div>
      <p>One table, three different answers. "How many rentals" is <code>COUNT(*)</code>; "how many renters" is <code>COUNT(DISTINCT customer_id)</code>; "how many were returned" is <code>COUNT(return_date)</code>.</p>` },
    { h: 'GROUP BY: one row per group', b: `
      ${SQL(`SELECT   region,
         COUNT(*)                    AS orders,
         COUNT(DISTINCT customer_id) AS customers
FROM     lecture.orders
GROUP BY region
ORDER BY orders DESC;`)}
      ${RES(['region', 'orders', 'customers'], [['Southeast', 41, 23], ['Northeast', 29, 22], ['West', 26, 21], ['Midwest', 24, 20]], '4 rows, one per region')}
      <ul>
        <li>GROUP BY splits the rows into groups and each aggregate runs <b>once per group</b>. The result has one row per distinct value of the grouping column: that is its <b>granularity</b>. Say what one row of the answer is before you write anything.</li>
        <li>The customer counts add up to 86, not 38: a customer can buy in more than one region. Totals of a breakdown that overlaps do not add up to the whole.</li>
        <li><b>The rule:</b> every column in SELECT must be in the GROUP BY or inside an aggregate. <code>SELECT region, order_date, COUNT(*) … GROUP BY region</code> is an error: one row per region cannot also show the order date. Fix by grouping on both or by aggregating (<code>MAX(order_date)</code>).</li>
        <li>Group by the <b>key</b>, not just the name. Two different reelhouse actors are called SUSAN DAVIS; <code>GROUP BY a.actor_id, a.first_name, a.last_name</code> keeps them apart.</li>
      </ul>` },
    { h: 'HAVING: filtering groups', b: `
      ${SQL(`-- Which regions had at least 12 orders in March?
SELECT   region, COUNT(*) AS orders
FROM     lecture.orders
WHERE    order_date >= '2026-03-01'   -- rows
GROUP BY region
HAVING   COUNT(*) >= 12               -- groups
ORDER BY orders DESC;`)}
      <ul>
        <li><b>HAVING filters groups, after aggregation. WHERE filters rows, before it.</b> "In March" is about rows: WHERE. "At least 12" is about groups: HAVING.</li>
        <li><code>WHERE SUM(units) &gt; 200</code> is an error: when WHERE runs, there are no sums yet.</li>
        <li>Filter rows in WHERE whenever you can; fewer rows reach the grouping step.</li>
        <li>"Which orders have three line items?" The three belongs in HAVING: <code>GROUP BY order_id HAVING COUNT(*) = 3</code>. Rows of order_items are one product on one order, so a row count per order is an item count.</li>
      </ul>` },
    { h: 'Where an alias works, and where it does not', b: `
      <div class="two">
        ${SQL(`-- error: column "new_price" does not exist
SELECT product_name,
       unit_price * 1.10 AS new_price
FROM   lecture.products
WHERE  new_price > 5;`, 'bad')}
        ${SQL(`-- error: column "order_count" does not exist
SELECT region, COUNT(*) AS order_count
FROM   lecture.orders
GROUP BY region
HAVING order_count >= 25;`, 'bad')}
      </div>
      ${SQL(`-- works: ORDER BY can see the alias
SELECT   region, COUNT(*) AS order_count
FROM     lecture.orders
GROUP BY region
HAVING   COUNT(*) >= 25
ORDER BY order_count DESC;`)}
      <p>Same alias, three clauses, two errors. The alias clearly exists, since ORDER BY can see it. The fix is to <b>repeat the expression, not the name</b>: <code>WHERE unit_price * 1.10 &gt; 5</code>, <code>HAVING COUNT(*) &gt;= 25</code>. Why? The order the database runs the clauses in.</p>
      <div class="tw"><table><tr><th>Written</th><th>Runs</th><th>Clause</th><th>Does</th></tr>
        <tr><td>1</td><td>5</td><td>SELECT</td><td>picks and computes the columns, names the aliases</td></tr>
        <tr><td>2</td><td>1</td><td>FROM</td><td>finds the table (and does the joins)</td></tr>
        <tr><td>3</td><td>2</td><td>WHERE</td><td>keeps rows</td></tr>
        <tr><td>4</td><td>3</td><td>GROUP BY</td><td>makes groups</td></tr>
        <tr><td>5</td><td>4</td><td>HAVING</td><td>keeps groups</td></tr>
        <tr><td>6</td><td>6</td><td>ORDER BY</td><td>sorts, and can use the aliases</td></tr>
        <tr><td>7</td><td>7</td><td>LIMIT</td><td>cuts</td></tr>
      </table></div>
      <p>An alias does not exist in WHERE or HAVING yet. It does in ORDER BY. The interactive version is on the <a href="#order">Order of execution</a> page.</p>` },
  ],
  cards: [
    ['What is the difference between WHERE and HAVING?', 'WHERE filters rows before grouping; HAVING filters groups after aggregation. A condition on a count or sum can only go in HAVING, because the count only exists once the rows are grouped.'],
    ['COUNT(*) vs COUNT(col) vs COUNT(DISTINCT col)', 'COUNT(*) counts rows. COUNT(col) counts rows where col is not NULL. COUNT(DISTINCT col) counts the different non-NULL values.'],
    ['Why does WHERE col = NULL return nothing?', 'Any comparison with NULL is unknown, not true, and WHERE keeps only true. Test with IS NULL or IS NOT NULL.'],
    ['Why can an alias not be used in WHERE?', 'WHERE runs before SELECT, and aliases are created at SELECT. ORDER BY runs after SELECT, so it can use them. Repeat the expression in WHERE or HAVING.'],
    ['How does the database read  A OR B AND C ?', 'As A OR (B AND C). AND binds tighter than OR. Write the parentheses yourself, or use IN.'],
    ['What does BETWEEN 10 AND 20 include?', 'Both ends: exactly >= 10 AND <= 20. Low value first, or it returns nothing.'],
    ['LIKE vs ILIKE; % vs _', 'LIKE is case-sensitive, ILIKE ignores case (PostgreSQL). % matches any run of characters including none; _ matches exactly one.'],
    ['What do aggregates do with NULLs?', 'Skip them. Over 10, NULL, 20: SUM is 30 and AVG is 15 (divided by 2, not 3). COUNT(col) skips them too; COUNT(*) does not.'],
    ['What is wrong with LIMIT 10 and no ORDER BY?', 'Row order is not guaranteed, so you get some 10 rows, not the top 10.'],
    ['The GROUP BY rule', 'Every column in SELECT must be in the GROUP BY or inside an aggregate. One row per region cannot also show an order date.'],
    ['What is the granularity of a result?', 'What one row of it is. GROUP BY region makes one row per region. Say it before you write the query, and count on it when you aggregate.'],
    ['The order a query runs in', 'FROM → WHERE → GROUP BY → HAVING → (window functions) → SELECT → ORDER BY → LIMIT.'],
    ['Is an empty string NULL?', 'No. It is a value. COUNT(col) counts it and IS NULL does not catch it. NULLIF(col, \'\') turns it into NULL.'],
    ['What does DISTINCT apply to?', 'The whole row of the result. SELECT DISTINCT region, customer_id gives distinct pairs, not distinct regions.'],
  ],
  quiz: [
    { t: 'mc', q: 'A colleague writes WHERE return_date = NULL to find unreturned rentals. It returns no rows and no error. Why?', o: ['The column has no NULLs', 'Comparing anything with NULL gives unknown, and WHERE keeps only true', 'NULL must be written in quotes', 'The query needs GROUP BY'], a: 1, why: 'NULL is never equal to anything, not even NULL. Use IS NULL. There are 241 unreturned rentals in reelhouse.' },
    { t: 'mc', q: '"Films rated G or PG that rent for $4.99." Which WHERE is correct?', o: ["rating = 'G' OR rating = 'PG' AND rental_rate = 4.99", "(rating = 'G' OR rating = 'PG') AND rental_rate = 4.99", "rating = 'G' AND rating = 'PG' AND rental_rate = 4.99", "rating IN ('G' OR 'PG') AND rental_rate = 4.99"], a: 1, why: 'Without parentheses AND binds first, so option a keeps every G film at any price. Option b, or rating IN (\'G\', \'PG\') AND rental_rate = 4.99, returns the 123 correct rows.' },
    { t: 'mc', q: 'SELECT title, length / 60.0 AS hours FROM film WHERE hours > 3; fails. Why?', o: ['Division is not allowed in SELECT', 'WHERE runs before SELECT, so the alias hours does not exist yet', 'The alias needs double quotes', 'length / 60.0 should be in HAVING'], a: 1, why: 'Aliases are created at SELECT, which runs after WHERE. Repeat the expression: WHERE length / 60.0 > 3. ORDER BY hours works because ORDER BY runs after SELECT.' },
    { t: 'mc', q: 'Over three rows holding 10, NULL and 20, what does AVG return?', o: ['10', '15', '30', 'NULL'], a: 1, why: 'Aggregates skip NULLs: 30 divided by the 2 values present. If the NULL really meant zero, you need AVG(COALESCE(x, 0)) to get 10.' },
    { t: 'mc', q: '"Which customers made at least 3 payments of $9.99 or more?" Where do the two conditions go?', o: ['Both in WHERE', 'Both in HAVING', '$9.99 in WHERE, at least 3 in HAVING', '$9.99 in HAVING, at least 3 in WHERE'], a: 2, why: 'amount belongs to one payment row, so it is filtered before grouping. COUNT(*) only exists after grouping, so "at least 3" is HAVING COUNT(*) >= 3.' },
    { t: 'mc', q: 'COUNT(address2) returns 999 of 1,003 addresses, yet no address has a second line. What explains it?', o: ['COUNT(col) counts NULLs', 'An empty string is a value, not NULL, so COUNT counts it', 'address2 is a text column so COUNT always counts it', 'The table has duplicate rows'], a: 1, why: '999 addresses store \'\' in address2. COUNT(NULLIF(address2, \'\')) returns 0, because NULLIF turns the empty string into a real NULL.' },
    { t: 'mc', q: 'Which query returns the 10 most expensive films?', o: ['SELECT title FROM film LIMIT 10', 'SELECT title FROM film ORDER BY rental_rate LIMIT 10', 'SELECT title FROM film ORDER BY rental_rate DESC LIMIT 10', 'SELECT title FROM film WHERE rental_rate = MAX(rental_rate)'], a: 2, why: 'LIMIT without ORDER BY returns some rows, not the top rows. ASC is the default, so option b gives the cheapest. Option d is an error: aggregates cannot go in WHERE.' },
    { t: 'mc', q: 'SELECT rating, COUNT(*) FROM film GROUP BY rating returns rows in the order G, PG, PG-13, R, NC-17 even with ORDER BY rating. Why?', o: ['The rows are in insertion order', 'rating is a special type with its own list order, and sorting follows the list', 'COUNT(*) changes the sort', 'The query has a bug'], a: 1, why: 'A column\'s type decides how it sorts. rating is an enumerated type whose order is the ratings list, not the alphabet.' },
    { t: 'fill', q: 'The PostgreSQL pattern operator that matches regardless of case is ______.', accept: ['ilike'], why: 'ILIKE. LIKE is case-sensitive, and reelhouse titles are stored in capitals, so LIKE \'%love%\' finds nothing.' },
    { t: 'mc', q: 'SELECT region, order_date, COUNT(*) FROM lecture.orders GROUP BY region; What happens?', o: ['One row per region with the first order date', 'One row per region with all dates concatenated', 'An error: order_date must appear in GROUP BY or an aggregate', 'One row per region and date'], a: 2, why: 'Every non-aggregated column in SELECT must be in the GROUP BY. A region has dozens of dates. Group by both, or use MAX(order_date).' },
    { t: 'mc', q: 'Which count answers "how many different customers rented in 2025"?', o: ['COUNT(*)', 'COUNT(customer_id)', 'COUNT(DISTINCT customer_id)', 'SUM(customer_id)'], a: 2, why: 'COUNT(*) counts rentals (9,092 in 2025). COUNT(DISTINCT customer_id) counts people (955). COUNT(customer_id) is the same as COUNT(*) here because the column has no NULLs.' },
    { t: 'mc', q: 'Where does BETWEEN 20 AND 25 put a replacement cost of exactly 25.00?', o: ['Excluded, the upper end is open', 'Included, both ends are included', 'Depends on the data type', 'Error, use <='], a: 1, why: 'BETWEEN low AND high is exactly >= low AND <= high. The 250 reelhouse films from 20 to 25 include the 24.99 ones and would include a 25.00.' },
    { t: 'short', q: 'In one sentence each: why can the $9.99 condition not go in HAVING, and why can "at least 3 payments" not go in WHERE?', why: 'HAVING runs after grouping, when amount no longer belongs to a single row, so a row-level test does not belong there (it would run on every row of each group with no sensible meaning). WHERE runs before grouping, when COUNT(*) does not exist yet, so a test on a count cannot go there.' },
    { t: 'mc', q: 'ORDER BY unit_price DESC, product_id. What is product_id doing?', o: ['Sorting the whole result by product_id', 'Breaking ties among equal prices so the order is fixed', 'Nothing; only the first column counts', 'Grouping the rows'], a: 1, why: 'The second sort column decides the order within ties on the first. Every exam sort includes a tie-breaker so that exactly one order is correct.' },
  ],
},
/* ------------------------------------------------------------------ 2 */
{
  id: 'joins', title: 'Joining tables', deck: 'Deck 2 · Matching, keeping, and multiplying rows',
  lede: 'Before you join, say what one row of each table is. The result has one row per match, so it takes the finest granularity on the path. Then decide what should happen to a row with no match.',
  secs: [
    { h: 'Four ways to join two tables', b: `
      <div class="tw"><table><tr><th>Join</th><th>Keeps</th><th>Use it for</th></tr>
        <tr><td><b>INNER JOIN</b> (or just JOIN)</td><td>rows with a match on both sides</td><td>almost everything</td></tr>
        <tr><td><b>LEFT JOIN</b></td><td>every row of the left table, matched or not</td><td>"including the ones with none", "show zero"</td></tr>
        <tr><td><b>RIGHT JOIN</b></td><td>every row of the right table</td><td>rarely; write it as a LEFT JOIN with the tables the other way round</td></tr>
        <tr><td><b>FULL JOIN</b></td><td>every row from both tables</td><td>reconciling two lists: "in the bank feed but not the ledger, and the reverse"</td></tr>
      </table></div>
      <p>Venn circles show which rows survive, but not a row being repeated. <b>Joins repeat rows.</b> In practice analysts write LEFT JOIN and put the table they want to keep first, so reading order matches meaning.</p>` },
    { h: 'INNER JOIN, row by row', b: `
      <div class="two">
        ${RES(['customer_id', 'first_name'], [[3, 'Sofia'], [6, 'Amara'], [11, 'Fiona']], 'customers')}
        ${RES(['order_id', 'customer_id'], [['ORD-1089', 3], ['ORD-1078', 6], ['ORD-1108', 6]], 'orders')}
      </div>
      ${RES(['customer_id', 'first_name', 'order_id'], [[3, 'Sofia', 'ORD-1089'], [6, 'Amara', 'ORD-1078'], [6, 'Amara', 'ORD-1108']], 'customers INNER JOIN orders: 3 rows. Amara twice, Fiona gone.')}
      <p>Each customer_id is matched to every order carrying the same value. <b>One row per match.</b> Amara has two orders, so she appears twice. Fiona has none, so she is dropped.</p>
      ${SQL(`SELECT   p.product_name, SUM(oi.units) AS total_units
FROM     lecture.order_items AS oi
JOIN     lecture.products    AS p
  ON     p.product_id = oi.product_id
GROUP BY p.product_name
HAVING   SUM(oi.units) > 200
ORDER BY total_units DESC;`)}
      <ul>
        <li><code>JOIN</code> names the second table; <code>ON</code> says which rows match: the key and the foreign key the ERD drew a line between.</li>
        <li>After the join, every column of both tables is available to SELECT, WHERE, GROUP BY.</li>
        <li><b>Table aliases</b> (<code>c</code>, <code>o</code>) are set in FROM and JOIN; AS is optional. Both tables have a customer_id, and <code>ON customer_id = customer_id</code> is "ambiguous": the database will not guess. Put the alias in front of <b>every</b> column in a join query.</li>
      </ul>` },
    { h: 'Following the foreign keys', b: `
      ${SQL(`-- How much has Amara Nguyen spent in total?
SELECT   c.first_name, c.last_name,
         SUM(oi.units * p.unit_price) AS spend
FROM     lecture.customers   AS c
JOIN     lecture.orders      AS o  ON o.customer_id = c.customer_id
JOIN     lecture.order_items AS oi ON oi.order_id   = o.order_id
JOIN     lecture.products    AS p  ON p.product_id  = oi.product_id
WHERE    c.customer_id = 6
GROUP BY c.first_name, c.last_name;   -- Amara Nguyen 238.00, from 4 joined rows`)}
      <ul>
        <li>Each further <code>JOIN … ON</code> adds one table. The path is the ERD: customers → orders → order_items → products. Four tables, three joins, one line of the ERD per ON.</li>
        <li>Revenue is units × price: units from one table, price from the other, multiplied row by row, then summed.</li>
        <li>Include every table in between, <b>even one you show no columns from</b>. A rental points to a copy (inventory), not to a film, so the film is two joins away. A customer's country is customer → address → city → country.</li>
        <li><b>Composite keys need both columns in ON.</b> returns points at one line item: <code>ON oi.order_id = r.order_id AND oi.product_id = r.product_id</code>. Leave one out and the query still runs but returns 34,427 rows for 16,131 returns.</li>
      </ul>` },
    { h: 'LEFT JOIN and the anti-join', b: `
      ${RES(['customer_id', 'first_name', 'order_id'], [[3, 'Sofia', 'ORD-1089'], [6, 'Amara', 'ORD-1078'], [6, 'Amara', 'ORD-1108'], [11, 'Fiona', null]], 'customers LEFT JOIN orders: 4 rows. Fiona kept, with NULL.')}
      <p>Every row of the left table survives. Where nothing matched, the right table's columns are NULL. Same matches as the INNER JOIN, plus one row for each unmatched customer.</p>
      ${SQL(`-- Customers who never ordered: the anti-join
SELECT   c.customer_id, c.first_name
FROM     lecture.customers AS c
LEFT JOIN lecture.orders   AS o ON o.customer_id = c.customer_id
WHERE    o.order_id IS NULL;        -- 2 rows: Fiona and Hugo Doyle`)}
      <ul>
        <li><b>Anti-join</b>: LEFT JOIN, then keep only the rows with no match. Test a column that cannot be NULL in a real match, such as the key.</li>
        <li>The <b>starting table matters</b>: "every customer, including those who never rented" starts from customer, not rental. A film with no copies is not in inventory, and no join from there can bring it back.</li>
        <li>Once a path starts keeping rows, <b>every join after it must keep them too</b>. country LEFT JOIN city INNER JOIN address drops the empty country again, because an empty column matches nothing. In reelhouse, Australia only appears with LEFT JOIN at every step.</li>
      </ul>` },
    { h: 'The trap: ON or WHERE?', b: `
      <p>Wanted: every customer, with the number of orders each placed in March.</p>
      <div class="two">
        ${SQL(`-- Date filter in ON: 40 rows, zeros shown
SELECT   c.customer_id, COUNT(o.order_id) AS march
FROM     lecture.customers AS c
LEFT JOIN lecture.orders   AS o
  ON     o.customer_id = c.customer_id
 AND     o.order_date >= '2026-03-01'
GROUP BY c.customer_id;`)}
        ${SQL(`-- Date filter in WHERE: 28 rows
SELECT   c.customer_id, COUNT(o.order_id) AS march
FROM     lecture.customers AS c
LEFT JOIN lecture.orders   AS o
  ON     o.customer_id = c.customer_id
WHERE    o.order_date >= '2026-03-01'
GROUP BY c.customer_id;`, 'bad')}
      </div>
      <p><b>ON decides which rows match.</b> Unmatched customers are still kept, with NULLs. <b>WHERE runs after the join.</b> For a kept customer, <code>o.order_date</code> is NULL, the comparison is unknown, and the row is dropped. The LEFT JOIN has quietly become an INNER JOIN. A condition on the right-hand table of a LEFT JOIN goes in ON when it decides what counts as a match.</p>
      <p class="trap"><b>Counting after a LEFT JOIN</b>The Doyles have one row each: the kept row, full of NULLs. <code>COUNT(*)</code> counts it: 1. <code>COUNT(o.order_id)</code> skips the NULL: 0, the truth. <b>After a LEFT JOIN, count a column from the right table, never *.</b> The reelhouse version: COUNT(*) says 42 films have 1 copy; those 42 really have 0.</p>` },
    { h: 'Fan-out: when joins multiply rows', b: `
      <p>orders JOIN order_items: one order matches two line items, so it appears twice. Nothing is wrong yet; the result's granularity is one line item. <b>It goes wrong when you count or add order-level things over line-level rows.</b></p>
      <div class="two">
        ${SQL(`-- COUNT(*) counts rows: Southeast 78
SELECT   o.region, COUNT(*) AS orders
FROM     lecture.orders AS o
JOIN     lecture.order_items AS oi
  ON     oi.order_id = o.order_id
GROUP BY o.region;`, 'bad')}
        ${SQL(`-- COUNT(DISTINCT) counts orders: Southeast 41
SELECT   o.region,
         COUNT(DISTINCT o.order_id) AS orders
FROM     lecture.orders AS o
JOIN     lecture.order_items AS oi
  ON     oi.order_id = o.order_id
GROUP BY o.region;`)}
      </div>
      <ul>
        <li>120 orders became 215 rows. COUNT(*) counted line items and called them orders. <code>COUNT(DISTINCT o.order_id)</code> counts each order once however many rows it fans out to.</li>
        <li><b>The wrong dollars:</b> about 8% of orders are paid in two payments. <code>SUM(p.amount) / COUNT(*)</code> gives $103.63 per payment; <code>SUM(p.amount) / COUNT(DISTINCT o.order_id)</code> gives $111.88 per order. The total is right in both; the denominator fanned out. A believable number, 7% low, no error. This is the fan-out that reaches a dashboard.</li>
        <li><b>Bridge tables fan out sums too.</b> A film in three genres puts each of its payments into all three. Revenue by genre is right per genre, but the 16 genres add up to 405,100.72 against 170,962.39 in payment. Revenue <i>by rating</i> through film_category is simply wrong: rating lives on film, so join only the tables the question needs.</li>
      </ul>
      <p class="trap"><b>The granularity of a join</b>Say what one row of each table is. The result takes the finest granularity on the path. Count the rows before and after: if the count went up and you did not expect it, something is now repeated. Count and add things at their own granularity: orders with COUNT(DISTINCT order_id), line amounts from line rows, payment amounts from payment rows.</p>` },
    { h: 'The four steps for choosing tables and join', b: `
      <ol>
        <li><b>What is one row of the answer?</b> One per customer, one per film, one per genre, one per rental. Say it before anything else.</li>
        <li><b>Where does each piece live?</b> Underline every column or number the question asks for or filters on, and find its table.</li>
        <li><b>Connect them.</b> Walk the paths. Include every table in between, even one you show no columns from.</li>
        <li><b>Pick the join.</b> Ask what should happen to a row that has no match on the other side.</li>
      </ol>
      <div class="tw"><table><tr><th>The question wants…</th><th>Words to look for</th><th>Join</th></tr>
        <tr><td>only the rows that have a match</td><td>"list each…", "show the…", "which… have"</td><td><span class="pill inner">INNER JOIN</span></td></tr>
        <tr><td>every row, matched or not</td><td>"including those with none", "every…, even…", "show zero"</td><td><span class="pill left">LEFT JOIN</span></td></tr>
        <tr><td>only the rows with no match</td><td>"never", "no…", "without", "missing", "not"</td><td><span class="pill anti">anti-join</span></td></tr>
      </table></div>
      <ul>
        <li>Not every question needs a join: copies per store is one table, inventory, grouped by store_id.</li>
        <li>A table can be mentioned without being needed: "films with no actors" never shows a name, so film_actor settles it without actor. "Actors in Horror films" needs no film table: both bridge tables already carry film_id.</li>
        <li>A query can mix joins: customers in Mexico who never rented is an INNER path out to country and an anti-join to rental. Pick the join for each branch separately.</li>
        <li>payment carries its own customer_id. Going through rental reaches the customer on the rental, who is the same person for all but 5 payments. "The customer who paid" means use payment.customer_id.</li>
      </ul>
      <p>Practice this on the <a href="#reason">Join reasoning</a> page.</p>` },
  ],
  cards: [
    ['INNER JOIN vs LEFT JOIN', 'INNER keeps only rows with a match on both sides. LEFT keeps every row of the left table, with NULLs on the right where nothing matched.'],
    ['What is an anti-join?', 'A LEFT JOIN followed by WHERE right_key IS NULL: keeps only the left rows that had no match. "Customers who never ordered."'],
    ['Why did my LEFT JOIN return the same rows as an INNER JOIN?', 'A WHERE condition on the right-hand table. Unmatched rows have NULL there, the test is unknown, and the row is dropped. Move the condition into ON.'],
    ['My order count doubled after I added a join. Why?', 'Fan-out: the joined table has several rows per order (line items, payments), so each order repeats. Count with COUNT(DISTINCT order_id) or aggregate at the right granularity.'],
    ['What does the ON clause do?', 'It decides which rows match. For a LEFT JOIN, unmatched left rows are still kept. WHERE runs after the join on the result.'],
    ['After a LEFT JOIN, COUNT(*) or COUNT(right.col)?', 'COUNT(right.col). The unmatched row exists with NULLs, so COUNT(*) reports 1 where the truth is 0.'],
    ['What is the granularity of a join result?', 'The finest granularity on the path: one row per match. Join orders to line items and every row is a line item.'],
    ['Why must a composite key use both columns in ON?', 'A key of (order_id, product_id) identifies one line item. Matching on order_id alone matches every product on the order: more rows than returns.'],
    ['Which table do you start from for "every X, including those with none"?', 'X. The LEFT JOIN keeps every row of the first table. Starting from the other side cannot bring back rows that are not there.'],
    ['A LEFT JOIN followed by an INNER JOIN on the same path', 'The INNER JOIN drops the unmatched rows again, because NULL matches nothing. Once a path keeps rows, every later join on it must be a LEFT JOIN too.'],
    ['RIGHT JOIN and FULL JOIN', 'a RIGHT JOIN b is b LEFT JOIN a. FULL JOIN keeps every row of both, NULLs on whichever side did not match; used for reconciling two lists.'],
    ['Why does revenue by genre add up to more than the total?', 'A film can be in several genres, so each payment is counted once per genre. Each genre is right on its own; the breakdown overlaps, so never add it up.'],
    ['Bridge table', 'A table whose rows are pairs, such as film_actor or film_category, with a two-column key. It is how a many-to-many relationship is stored, and the path always goes through it.'],
    ['Why group by the key and not just the name?', 'Two different actors can share a name (two SUSAN DAVIS). Grouping by name alone merges them.'],
  ],
  quiz: [
    { t: 'mc', q: 'customers has Sofia (one order), Amara (two orders) and Fiona (none). How many rows does customers INNER JOIN orders return?', o: ['3', '4', '2', '6'], a: 0, why: 'One row per match: Sofia once, Amara twice, Fiona not at all. The LEFT JOIN would return 4, with Fiona\'s order columns NULL.' },
    { t: 'mc', q: 'The request is "every customer with their 2025 rentals, including those with none." The query has LEFT JOIN rental r ON r.customer_id = cu.customer_id WHERE r.rental_date >= \'2025-01-01\'. The smallest count is 1, never 0. Why?', o: ['COUNT needs DISTINCT', 'The WHERE on the right-hand table drops the NULL rows the LEFT JOIN kept', 'LEFT JOIN should be RIGHT JOIN', 'The date is in the wrong format'], a: 1, why: 'A customer with no 2025 rental has NULL rental_date; NULL >= a date is unknown; WHERE drops the row. Move the date test into ON. Broken: 955 rows; fixed: 999, with 44 zeros.' },
    { t: 'mc', q: 'film LEFT JOIN inventory, GROUP BY film, COUNT(*) AS copies. What does a film with no copies show?', o: ['0', '1', 'NULL', 'An error'], a: 1, why: 'The LEFT JOIN keeps the film as one row with NULL inventory columns, and COUNT(*) counts that row. COUNT(i.inventory_id) gives 0.' },
    { t: 'mc', q: 'Revenue by rating, joined through film_category and category, adds up to 405,100 against 170,962 in payment. Where does the extra come from?', o: ['Payments with no rental', 'Each payment repeats once per genre of its film', 'SUM rounds up', 'The rating column has duplicates'], a: 1, why: 'film_category has two or three rows for most films, so the join repeats each payment. Rating lives on film, so drop the category tables.' },
    { t: 'mc', q: '"Which films are not stocked at any store?" Which tables?', o: ['film, inventory, store', 'film, inventory', 'inventory only', 'film, rental'], a: 1, why: 'inventory already holds store_id and the question does not care which store. Anti-join from film to inventory: 42 films.' },
    { t: 'mc', q: '"Every country with the number of customers, including countries with none." What goes wrong if only the first join is a LEFT JOIN?', o: ['Nothing, the first LEFT JOIN is enough', 'The later INNER JOINs drop the empty country again because NULL matches nothing', 'The counts double', 'The query fails'], a: 1, why: 'Once a path keeps rows, every join after it must keep them. With an inner join anywhere on the path, Australia disappears.' },
    { t: 'mc', q: '"Films that store 2 does not carry." Where does store_id = 2 go?', o: ['In WHERE, with inventory_id IS NULL', 'In ON, with inventory_id IS NULL in WHERE', 'In HAVING', 'In SELECT'], a: 1, why: 'In ON it decides which inventory rows may match, so a film stocked only at store 1 gets NULLs and survives. In WHERE, store_id = 2 and inventory_id IS NULL can never both be true: 0 rows.' },
    { t: 'mc', q: 'SUM(p.amount) / COUNT(*) over orders JOIN order_payments is $103.63; divided by COUNT(DISTINCT o.order_id) it is $111.88. Which is average order value?', o: ['$103.63', '$111.88', 'Both', 'Neither'], a: 1, why: 'Some orders have two payments, so COUNT(*) counts payments. The total is right in both; only the denominator fanned out.' },
    { t: 'mc', q: '"Which actors have appeared in Horror films?" Minimum tables?', o: ['actor, film_actor, film, film_category, category', 'actor, film_actor, film_category, category', 'actor, film, category', 'actor, category'], a: 1, why: 'Nothing from film is shown or filtered on. Both bridge tables carry film_id, so film_actor joins straight to film_category. Including film is correct but one join more than needed.' },
    { t: 'mc', q: 'A colleague wrote film JOIN inventory LEFT JOIN rental WHERE rental_id IS NULL to find films never rented, and got 0 rows. Why?', o: ['Every film has been rented', 'The INNER JOIN to inventory drops films with no copies before the LEFT JOIN runs, and every existing copy has been rented', 'IS NULL should be = NULL', 'rental has no rental_id column'], a: 1, why: 'The 42 never-rented films are exactly the ones with no copies, and the inner join removed them. Both joins must be LEFT JOINs. copies_never_rented from inventory to rental is 0.' },
    { t: 'mc', q: 'Why is ON customer_id = customer_id an error when joining customers to orders?', o: ['ON needs the table names: the column reference is ambiguous', 'ON must use <>', 'You cannot join on a key', 'The columns are different types'], a: 0, why: 'Both tables have a customer_id. Alias the tables and write ON o.customer_id = c.customer_id.' },
    { t: 'fill', q: 'The join pattern "LEFT JOIN, then WHERE right_key IS NULL" is called an ______.', accept: ['anti-join', 'anti join', 'antijoin'], why: 'Anti-join: keeps the left rows with no match.' },
    { t: 'mc', q: 'After rental JOIN inventory JOIN film JOIN film_category JOIN category, what is one row?', o: ['One film', 'One rental', 'One rental in one genre', 'One genre'], a: 2, why: 'The finest granularity on the path. A rental of a film in three genres becomes three rows, which is why the rentals column adds up to 122,666 against 51,805 rentals.' },
    { t: 'short', q: 'A manager asks for "total revenue by customer, from customers, orders, order items and products." Describe the join path and the aggregate.', why: 'customers → orders (customer_id) → order_items (order_id) → products (product_id). Revenue is SUM(oi.units * p.unit_price), GROUP BY c.customer_id, c.first_name, c.last_name. If customers with no orders must appear with 0, use LEFT JOIN at every step and COALESCE(SUM(...), 0).' },
  ],
},
/* ------------------------------------------------------------------ 3 */
{
  id: 'shaping', title: 'Shaping data', deck: 'Deck 3 · Buckets, blanks, and dates',
  lede: 'The database stores facts; you decide how they read. Every column in a report is a decision: what bucket, what blank, what date.',
  secs: [
    { h: 'CASE: if-then logic in SQL', b: `
      ${SQL(`SELECT   product_name, unit_price,
         CASE
           WHEN unit_price < 5  THEN 'Under $5'
           WHEN unit_price < 15 THEN '$5 to $15'
           ELSE '$15 and up'
         END AS price_tier
FROM     lecture.products
ORDER BY unit_price;`)}
      <ul>
        <li>CASE is an <b>expression</b>: it produces one value per row, like <code>units * unit_price</code> does, anywhere a column could go.</li>
        <li>Each WHEN is tested in order; <b>the first one that is true decides the value</b>. ELSE catches the rest. <code>END AS price_tier</code> names the column; without a name it is called <code>case</code>.</li>
        <li>Use it to bucket a number, flag a condition, relabel a value, or build report columns. It is a nested IF in Excel read top to bottom instead of inside out.</li>
      </ul>
      <p class="trap"><b>The two traps</b><b>Wrong order:</b> <code>WHEN unit_price &gt;= 5 THEN '$5 to $15' WHEN unit_price &gt;= 15 THEN '$15 and up'</code> puts the $28 Gift Box in "$5 to $15"; no product ever reaches the second WHEN. Order the WHENs from most specific to least (Free before Under $3, because 0 is also under 3), or write each range in full. <b>No ELSE:</b> rows that match no WHEN get NULL, silently. Always write an ELSE; if nothing should reach it, make it say so: <code>ELSE 'Check me'</code>.</p>
      ${SQL(`-- Group by the bucket; sort the buckets by money, not alphabet
SELECT   CASE WHEN p.unit_price < 5 THEN 'Under $5'
              WHEN p.unit_price < 15 THEN '$5 to $15'
              ELSE '$15 and up' END AS price_tier,
         SUM(oi.units) AS units
FROM     lecture.order_items AS oi
JOIN     lecture.products    AS p ON p.product_id = oi.product_id
GROUP BY price_tier
ORDER BY MIN(p.unit_price);`)}
      <p>PostgreSQL accepts the alias in GROUP BY. <code>ORDER BY MIN(p.unit_price)</code> puts the tiers cheapest first; sorting by the label would put "$5 to $15" before "Under $5".</p>` },
    { h: 'Rows to columns: conditional aggregation', b: `
      ${SQL(`SELECT o.region,
  SUM(CASE WHEN p.category = 'Beverages' THEN oi.units * p.unit_price ELSE 0 END) AS beverages,
  SUM(CASE WHEN p.category = 'Bakery'    THEN oi.units * p.unit_price ELSE 0 END) AS bakery,
  -- two more columns the same way
  SUM(oi.units * p.unit_price) AS total
FROM   lecture.orders      AS o
JOIN   lecture.order_items AS oi ON oi.order_id = o.order_id
JOIN   lecture.products    AS p  ON p.product_id = oi.product_id
GROUP BY o.region
ORDER BY total DESC;`)}
      ${RES(['region', 'beverages', 'bakery', 'packaged', 'merch', 'total'], [['Southeast', '1,846.50', '1,164.00', '1,050.25', '652.00', '4,712.75'], ['Northeast', '1,375.20', '652.00', '760.50', '212.00', '2,999.70']], '4 rows instead of 16: one per region, a column per category')}
      <ul>
        <li><b>GROUP BY makes the rows; a CASE inside each SUM makes a column.</b> This is the manual pivot. Same twelve numbers as the long GROUP BY result; nothing added or lost, only the shape changed.</li>
        <li>To count instead of add: <code>COUNT(CASE WHEN … THEN 1 END)</code>. <b>No ELSE on purpose</b>: rows that miss get NULL and COUNT skips them.</li>
      </ul>
      <p class="trap"><b>ELSE 0 inside COUNT</b>COUNT counts every value that is not NULL, and 0 is not NULL, so <code>COUNT(CASE … THEN 1 ELSE 0 END)</code> counts every row: late = returned. Either drop the ELSE, or keep ELSE 0 and change COUNT to <code>SUM</code>, which adds the 1s and 0s.</p>` },
    { h: 'Three kinds of blank, and COALESCE', b: `
      <div class="tw"><table><tr><th>A NULL can mean</th><th>Example</th></tr>
        <tr><td>Does not apply</td><td>refund_amount on an exchange: no money changed hands</td></tr>
        <tr><td>Not yet</td><td>churned_on for a member who has not left; return_date on a rental still out</td></tr>
        <tr><td>No match</td><td>every orders column after a LEFT JOIN, for a customer who never ordered: made by your query, never in any table</td></tr>
      </table></div>
      <p><b>NULL never means zero.</b> What it should become in a report depends on which kind it is.</p>
      ${SQL(`COALESCE(value_1, value_2, …, fallback)   -- the first argument that is not NULL
COALESCE(NULL, 0)            -- 0
COALESCE(12.50, 0)           -- 12.50
COALESCE(NULL, NULL, 'none') -- none`)}
      <ul>
        <li>Use it to show a zero (a customer with no orders spent 0), fall back to another column (a nickname, else the first name), or label a blank (no region becomes Unassigned).</li>
        <li>COALESCE changes what the report says, not what the table holds. <b>Use it only when the replacement is true.</b> The Doyles' spend is 0: a known fact. A 0 for an exchange's refund would move the average refund from $33.93 to $25.57, which is a lie.</li>
        <li><b>Every argument must be the same type.</b> <code>COALESCE(return_date, 'Not returned')</code> fails: PostgreSQL tries to read the text as a date. CAST the date to text first.</li>
      </ul>
      <p>Why a blank spend needs a zero: with a blank, "filter for spend under $50" leaves the Doyles out and "average spend" divides by 38; with $0 they are first in line for the win-back offer and the average divides by all 40. COALESCE writes down what the business already knows so every reader, filter and formula downstream treats it the same way.</p>` },
    { h: 'NULL in arithmetic and in aggregates', b: `
      <div class="two">
        ${RES(['row by row', 'result'], [['5 + NULL', null], ['NULL * 0', null], ["'Amara ' || NULL", null], ['COALESCE(NULL, 0) + 5', 5]], 'NULL spreads')}
        ${RES(['down a column (40 customers)', 'result'], [['COUNT(*)', 40], ['COUNT(spend)', 38], ['AVG(spend)', '345.62'], ['AVG(COALESCE(spend, 0))', '328.34']], 'NULL is skipped')}
      </div>
      <p>Any arithmetic with a NULL in it is NULL. SUM, AVG, MIN, MAX and COUNT(col) ignore NULLs. AVG(spend) is the average over the 38 who ordered; with COALESCE, over all 40. <b>Both are correct; they answer different questions.</b> Decide which one the report means and name the column for it: avg_spend_buyers or avg_spend_all.</p>` },
    { h: 'CAST, integer division and NULLIF', b: `
      <p>Every value has a type, and the type decides what it can do: how it sorts, compares, and divides. <code>CAST(x AS type)</code> converts a value; the meaning stays, the type changes, and the table is untouched. Text to date so it sorts by calendar; a count to numeric so a division keeps its fraction; a timestamp to date so a report shows the day; a number to text so it can join a label. <code>x::numeric</code> is the PostgreSQL shorthand.</p>
      ${SQL(`SELECT region,
       COUNT(CASE WHEN order_date >= '2026-03-01' THEN 1 END) / COUNT(*) AS march_share,  -- 0 in every row
       ROUND(100 * CAST(COUNT(CASE WHEN order_date >= '2026-03-01' THEN 1 END) AS numeric)
             / COUNT(*), 1) AS march_pct                                                -- 45.8
FROM   lecture.orders
GROUP BY region;`)}
      <ul>
        <li><b>An integer divided by an integer is an integer.</b> 11 / 24 is 0, 7 / 2 is 3. The fraction is thrown away, not rounded. <code>CAST(x AS numeric)</code> on one side keeps it; so does <code>100.0 * x</code>.</li>
        <li><code>NULLIF(a, b)</code> returns NULL when a equals b, and a otherwise. <b>Dividing by NULL gives NULL, not an error</b>, so <code>/ NULLIF(COUNT(o.order_id), 0)</code> is safe division. A share of no orders does not exist; NULL says so honestly, 0 would not.</li>
        <li>NULLIF is not only for division: <code>NULLIF(address2, '')</code> turns an empty string into a real NULL so that COUNT and COALESCE treat it as missing.</li>
      </ul>` },
    { h: 'Dates are not text', b: `
      <div class="two">
        ${SQL(`-- 8,771: '2026-03-31' means midnight,
-- so all of 31 March is left out
SELECT COUNT(*) FROM orders
WHERE  ordered_at BETWEEN '2026-03-01'
                      AND '2026-03-31';`, 'bad')}
        ${SQL(`-- 9,036: every order in March
SELECT COUNT(*) FROM orders
WHERE  ordered_at >= '2026-03-01'
  AND  ordered_at <  '2026-04-01';`)}
      </div>
      <ul>
        <li>A <b>date</b> is a day. A <b>timestamp</b> is an instant. A date written against a timestamp means midnight. <b><code>&gt;= start AND &lt; next start</code> is right for both</b>; BETWEEN is safe only on a column that holds plain dates. The labs' columns are dates; reelhouse's rental_date and payment_date are timestamps.</li>
        <li><code>DATE_TRUNC('month', order_date)</code> rolls a date back to the start of its week, month, quarter or year. It returns a timestamp, so <code>CAST(DATE_TRUNC('month', d) AS date)</code> gives 2026-03-01 instead of 2026-03-01 00:00:00. "A month is a date" on the exam.</li>
        <li><code>EXTRACT(part FROM d)</code> returns one number: YEAR, MONTH, DAY, QUARTER, HOUR, DOW. <b>DOW: 0 Sunday, 1 Monday … 6 Saturday.</b></li>
        <li>The <code>DATE</code> keyword marks quoted text as a date: <code>DATE '2026-03-31' - MAX(o.order_date)</code> is days since. Without it, text minus text fails.</li>
      </ul>
      <div class="tw"><table><tr><th>Expression</th><th>Result</th></tr>
        <tr><td><code>DATE '2026-03-31' - DATE '2026-01-13'</code></td><td>77, a whole number of days</td></tr>
        <tr><td><code>DATE '2026-01-31' + 30</code></td><td>2026-03-02, still a date</td></tr>
        <tr><td><code>DATE '2026-01-31' + INTERVAL '1 month'</code></td><td>2026-02-28 00:00:00, a timestamp</td></tr>
        <tr><td><code>return_date - rental_date</code> (timestamps)</td><td>an interval, exact to the second: 7 days 04:43:05</td></tr>
        <tr><td><code>CAST(return_date AS date) - CAST(rental_date AS date)</code></td><td>8, calendar dates apart (out at 9 p.m., back after midnight)</td></tr>
      </table></div>
      <p>Time zones: a timestamp with time zone is grouped in the session's zone. <code>SET TIME ZONE 'UTC'</code> first, or write the instant with its offset, <code>TIMESTAMPTZ '2025-03-01 00:00:00+00'</code>. Date functions are the part of SQL that varies most between databases; CASE, COALESCE, NULLIF and CAST are standard everywhere.</p>` },
    { h: 'The rows that are not there', b: `
      <div class="two">
        ${SQL(`-- GROUP BY the order date: 67 rows.
-- 1, 3 and 4 January are not zero.
-- They are not there.
SELECT   order_date, COUNT(*) AS orders
FROM     lecture.orders
GROUP BY order_date
ORDER BY order_date;`, 'bad')}
        ${SQL(`-- Start from the calendar: 90 rows
SELECT   cal.calendar_date,
         COUNT(o.order_id) AS orders
FROM     calendar AS cal
LEFT JOIN lecture.orders AS o
  ON     o.order_date = cal.calendar_date
WHERE    cal.calendar_date >= '2026-01-01'
  AND    cal.calendar_date <  '2026-04-01'
GROUP BY cal.calendar_date
ORDER BY cal.calendar_date;`)}
      </div>
      <p>Average orders per day: 1.79 over the 67 days with orders, but 1.33 over all 90. The first is too high and nothing says so. A calendar table has one row per day; LEFT JOIN the orders to it, count a column from the right, and the closed days come back as 0. The WHERE on cal.calendar_date is safe because it tests the left table.</p>
      ${SQL(`-- The report, assembled: what date, what bucket, what blank
SELECT CAST(DATE_TRUNC('month', o.order_date) AS date) AS month,
       SUM(CASE WHEN o.region = 'Southeast' THEN oi.units * p.unit_price ELSE 0 END) AS southeast,
       SUM(oi.units * p.unit_price) AS revenue,
       ROUND(SUM(oi.units * p.unit_price) / NULLIF(COUNT(DISTINCT o.order_id), 0), 2) AS avg_order
FROM   lecture.orders AS o
JOIN   lecture.order_items AS oi ON oi.order_id = o.order_id
JOIN   lecture.products    AS p  ON p.product_id = oi.product_id
GROUP BY month
ORDER BY month;`)}` },
  ],
  cards: [
    ['How does CASE choose a value?', 'WHENs are tested top to bottom; the first true one wins; ELSE catches the rest. No ELSE means NULL for rows that match nothing.'],
    ['Why order WHENs from most specific to least?', 'Because the first match wins. WHEN amount < 6 before WHEN amount < 3 means nothing ever reaches the second; Free (= 0) must come before Under $3.'],
    ['Conditional aggregation', 'A CASE inside SUM or COUNT makes one report column per condition: SUM(CASE WHEN category = \'Bakery\' THEN revenue ELSE 0 END). GROUP BY makes the rows. The manual pivot.'],
    ['COUNT(CASE WHEN … THEN 1 END) vs with ELSE 0', 'Without ELSE the misses are NULL and COUNT skips them. With ELSE 0, 0 is not NULL and COUNT counts every row. Use SUM with ELSE 0.'],
    ['COALESCE(a, b, c)', 'The first argument that is not NULL, left to right. All arguments must be one type. Use it when the replacement is true: 0 for a customer who never ordered.'],
    ['Does AVG include NULL values?', 'No. It divides by the values present. AVG(spend) is over buyers; AVG(COALESCE(spend, 0)) is over everyone. Both correct, different questions.'],
    ['Why does 7 / 2 return 3?', 'Integer divided by integer is an integer; the fraction is dropped. CAST one side to numeric, or multiply by 100.0.'],
    ['How do you avoid a divide-by-zero error?', 'Divide by NULLIF(denominator, 0). NULLIF returns NULL when the two are equal, and dividing by NULL gives NULL instead of an error.'],
    ['Why is a March count low with BETWEEN \'2026-03-01\' AND \'2026-03-31\'?', 'Against a timestamp, \'2026-03-31\' means midnight at the start of the day, so all of 31 March is left out. Use >= \'2026-03-01\' AND < \'2026-04-01\'.'],
    ['DATE_TRUNC vs EXTRACT', 'DATE_TRUNC(\'month\', d) rolls d back to the start of its month (a timestamp; cast to date). EXTRACT(MONTH FROM d) returns the number 3.'],
    ['PostgreSQL day-of-week numbering', 'EXTRACT(DOW FROM d): 0 Sunday, 1 Monday, … 6 Saturday.'],
    ['date minus date; timestamp minus timestamp', 'Date minus date is a whole number of days. Timestamp minus timestamp is an interval. DATE \'2026-01-31\' + 30 is still a date.'],
    ['How do you show every day, including days with no orders?', 'Start from a calendar table, LEFT JOIN the orders to it, COUNT a column from orders. The empty days come back as 0.'],
    ['Three kinds of NULL', 'Does not apply, not yet, and no match (made by a LEFT JOIN, never in any table). NULL never means zero.'],
    ['NULLIF(address2, \'\')', 'Turns an empty string into a real NULL so COUNT skips it and COALESCE can replace it.'],
  ],
  quiz: [
    { t: 'mc', q: 'CASE WHEN amount < 6 THEN \'$3 to $5.99\' WHEN amount < 3 THEN \'Under $3\' WHEN amount = 0 THEN \'Free\' ELSE \'$6 and up\' END. What is wrong?', o: ['Nothing', 'Every amount under 3 is also under 6, so the first WHEN claims it and the other branches never run', 'ELSE is not allowed after three WHENs', 'The labels must be numbers'], a: 1, why: 'First match wins. Order from most specific to least: = 0, then < 3, then < 6.' },
    { t: 'mc', q: 'COUNT(CASE WHEN days_kept > rental_duration THEN 1 ELSE 0 END) AS late equals the total count on every row. Why?', o: ['COUNT ignores CASE', 'COUNT counts non-NULL values and 0 is not NULL, so every row counts', 'The comparison is always true', 'rental_duration is NULL'], a: 1, why: 'Drop the ELSE so misses become NULL, or keep ELSE 0 and use SUM. Fixed: 11,250 and 11,302 late returns.' },
    { t: 'mc', q: 'COALESCE(return_date, \'Not returned\') fails with "invalid input syntax for type date". Why?', o: ['COALESCE only takes two numbers', 'All arguments must be one type, and the first is a date, so the text is read as a date', 'return_date has no NULLs', 'Dates cannot be used in COALESCE'], a: 1, why: 'CAST the date to text first: COALESCE(CAST(CAST(return_date AS date) AS text), \'Not returned\').' },
    { t: 'mc', q: '12600 / 25761 inside a percentage returns 0. Fix?', o: ['Use ROUND', 'CAST one side to numeric, or multiply by 100.0 first', 'Swap the operands', 'Use AVG'], a: 1, why: 'Both counts are integers, so the division is integer division and the remainder is dropped. CAST(x AS numeric) / y keeps the fraction.' },
    { t: 'mc', q: 'For the two customers who never ordered, march_pct = 100 * march_orders / COUNT(o.order_id) would divide by zero. The safe version is', o: ['/ COALESCE(COUNT(o.order_id), 1)', '/ NULLIF(COUNT(o.order_id), 0)', '/ COUNT(*)', 'WHERE COUNT(o.order_id) > 0'], a: 1, why: 'NULLIF turns 0 into NULL and division by NULL is NULL, so those customers show a blank share: honest, since a share of no orders does not exist.' },
    { t: 'mc', q: 'payment_date is a timestamp. WHERE payment_date BETWEEN \'2025-03-01\' AND \'2025-03-31\' returns 728 payments; the right answer is 751. Why?', o: ['BETWEEN excludes both ends', '\'2025-03-31\' means midnight at the start of 31 March, so that whole day is left out', 'March has 30 days', 'The quotes should be double'], a: 1, why: 'Use >= \'2025-03-01\' AND < \'2025-04-01\'. On a plain date column BETWEEN would be fine.' },
    { t: 'mc', q: 'What does EXTRACT(DOW FROM DATE \'2026-03-01\') return for a Sunday?', o: ['1', '7', '0', '\'Sunday\''], a: 2, why: 'PostgreSQL numbers the days 0 (Sunday) through 6 (Saturday).' },
    { t: 'mc', q: 'Which expression returns the month as a date, 2025-01-01, rather than a timestamp?', o: ["DATE_TRUNC('month', order_date)", "EXTRACT(MONTH FROM order_date)", "CAST(DATE_TRUNC('month', order_date) AS date)", "order_date::month"], a: 2, why: 'DATE_TRUNC returns a timestamp; the CAST makes it a date. EXTRACT returns the number 1.' },
    { t: 'mc', q: 'GROUP BY order_date shows 67 days in a 90-day quarter. The missing 23 days are', o: ['Zero', 'Not in the result at all', 'NULL', 'Counted in the next day'], a: 1, why: 'A GROUP BY can only show values that exist in the rows. Start from a calendar table with a LEFT JOIN to get the 23 zeros, and the daily average drops from 1.79 to 1.33.' },
    { t: 'mc', q: 'AVG(spend) over 40 customers, two of whom have NULL spend, is 345.62. AVG(COALESCE(spend, 0)) is 328.34. Which is correct?', o: ['345.62', '328.34', 'Both, for different questions', 'Neither'], a: 2, why: 'The first is the average over the 38 buyers, the second over all 40. Name the column for the one the report means.' },
    { t: 'mc', q: 'CAST(return_date AS date) - CAST(rental_date AS date) gives 8 while return_date - rental_date gives 7 days 04:43:05. Why?', o: ['A bug in CAST', 'Date minus date counts calendar dates apart; the film went out at 9 p.m. and came back after midnight', 'Intervals round down', 'The time zone is wrong'], a: 1, why: 'Subtracting dates gives whole calendar days; subtracting timestamps gives an exact interval.' },
    { t: 'fill', q: 'To sort price tiers cheapest first rather than alphabetically, ORDER BY ______(unit_price).', accept: ['min'], why: 'ORDER BY MIN(price) sorts the buckets by money. Sorting by the label puts "$5 to $15" before "Under $5".' },
    { t: 'short', q: 'Marketing wants every customer\'s total spend to pick who gets a win-back offer. Two customers have never ordered. Should their spend show as blank or $0, and why?', why: '$0, with COALESCE(SUM(...), 0). A blank tells the reader "unknown", but a customer with no orders has a known spend of zero. With a blank they are left out of a "spend under $50" filter and the average divides by 38; with $0 they are first in line and the average covers all 40.' },
    { t: 'mc', q: 'Revenue 2023, 2024 and 2025 as three columns on one row per country. Which tool?', o: ['Three queries', 'GROUP BY country, year', 'SUM(CASE WHEN year = 2023 THEN revenue ELSE 0 END) and so on, GROUP BY country', 'DATE_TRUNC'], a: 2, why: 'Conditional aggregation: GROUP BY makes the rows, a CASE inside each SUM makes a column. GROUP BY country, year gives the long shape, one row per country per year.' },
  ],
},
/* ------------------------------------------------------------------ 4 */
{
  id: 'multi', title: 'Multi-step analysis', deck: 'Deck 4 · Common table expressions and window functions',
  lede: 'A hard question is a few easy ones in a row. Name each step, check it, and build the next one on top. Then compute across rows without collapsing them.',
  secs: [
    { h: 'One question, three steps', b: `
      <p>"Which customers spent more than the average customer?"</p>
      <div class="tw"><table><tr><th>Step</th><th>In plain English</th><th>What comes back</th></tr>
        <tr><td>1</td><td>Add up what each customer spent</td><td>38 rows, one per customer who ordered</td></tr>
        <tr><td>2</td><td>Take the average of those totals</td><td>One number: $345.62</td></tr>
        <tr><td>3</td><td>Keep the customers whose total is above it</td><td>11 customers</td></tr>
      </table></div>
      <p>Each step is a query you already know how to write. <b>Step 2 cannot be written until step 1 exists: it is the average of a result, not of a column.</b></p>
      ${SQL(`-- A scalar subquery: one row, one column, used where a number would go
SELECT   product_name, unit_price
FROM     lecture.products
WHERE    unit_price > (SELECT AVG(unit_price) FROM lecture.products)
ORDER BY unit_price DESC;   -- 7 rows; the average is $10.43`)}
      <p>The query in parentheses runs first and returns one value. Write it yourself when the inner step is one number.</p>` },
    { h: 'WITH: name the steps', b: `
      ${SQL(`WITH spend AS (                                   -- step 1
  SELECT   c.customer_id, c.first_name, c.last_name,
           SUM(oi.units * p.unit_price) AS spend
  FROM     lecture.customers   AS c
  JOIN     lecture.orders      AS o  ON o.customer_id = c.customer_id
  JOIN     lecture.order_items AS oi ON oi.order_id   = o.order_id
  JOIN     lecture.products    AS p  ON p.product_id  = oi.product_id
  GROUP BY c.customer_id, c.first_name, c.last_name
)
SELECT   first_name, last_name, spend                 -- step 3
FROM     spend
WHERE    spend > (SELECT AVG(spend) FROM spend)       -- step 2
ORDER BY spend DESC;                                  -- 11 rows`)}
      <ul>
        <li><code>WITH name AS (…)</code> gives a query result a name; the rest of the statement uses it like a table. A <b>common table expression</b>, or CTE. Nothing is saved.</li>
        <li>Several steps: one WITH, <b>commas between the steps</b>, each with a name. A step can read only the steps above it.</li>
        <li><b>Build it, check it, build on it.</b> Run <code>SELECT * FROM spend;</code> while you build; the first surprising result is the bug. A WITH … SELECT is still a SELECT query.</li>
      </ul>
      ${SQL(`-- An aggregate of an aggregate: two groupings, one statement
WITH labeled AS (
  SELECT c.customer_id,
    CASE WHEN MAX(o.order_date) IS NULL THEN 'Never ordered'
         WHEN DATE '2026-03-31' - MAX(o.order_date) <= 30 THEN 'Active'
         WHEN DATE '2026-03-31' - MAX(o.order_date) <= 60 THEN 'Lapsing'
         ELSE 'Lapsed' END AS status
  FROM lecture.customers AS c
  LEFT JOIN lecture.orders AS o ON o.customer_id = c.customer_id
  GROUP BY c.customer_id
)
SELECT   status, COUNT(*) AS customers
FROM     labeled
GROUP BY status
ORDER BY customers DESC;   -- Active 28 · Lapsing 8 · Lapsed 2 · Never ordered 2`)}
      <p>The label needs a MAX per customer; the count needs a GROUP BY on the label. One GROUP BY cannot do both; the CTE finishes the first before the second starts.</p>` },
    { h: 'An aggregate collapses rows; a window keeps them', b: `
      <div class="two">
        ${SQL(`SELECT SUM(units) AS total_units
FROM   lecture.order_items;
-- 1 row: 2,262. The 215 line items are gone.`)}
        ${SQL(`SELECT order_id, product_id, units,
       SUM(units) OVER () AS total_units
FROM   lecture.order_items;
-- 215 rows. Every row keeps itself, with 2,262 beside it.`)}
      </div>
      <ul>
        <li><code>OVER ()</code> turns an aggregate into a <b>window function</b>: it still adds up the rows, but writes the answer onto each row instead of collapsing them. Now one row can be compared with the whole: <code>units / total_units</code> is each line's share.</li>
        <li><b>Group first, window second.</b> The CTE makes one row per region; the window adds them up again without collapsing them. The total can never go stale against its parts.</li>
      </ul>
      ${SQL(`WITH by_region AS (
  SELECT o.region, SUM(oi.units * p.unit_price) AS revenue
  FROM   lecture.orders o
  JOIN   lecture.order_items oi ON oi.order_id = o.order_id
  JOIN   lecture.products p     ON p.product_id = oi.product_id
  GROUP BY o.region
)
SELECT region, revenue,
       SUM(revenue) OVER ()                           AS total,
       ROUND(100 * revenue / SUM(revenue) OVER (), 1) AS pct
FROM   by_region
ORDER BY revenue DESC;   -- Southeast 35.9 · Northeast 22.8 · Midwest 21.7 · West 19.6`)}
      <p><code>PARTITION BY category</code> restarts the window for each category: the SUM is over the rows that share this row's category. <b>It is GROUP BY for a window</b>: it decides what the whole is, without collapsing anything. <code>ROUND(100 * revenue / SUM(revenue) OVER (PARTITION BY category), 1)</code> is each product's share of its category, and each category's products add up to 100.</p>` },
    { h: 'Three ways to rank', b: `
      <div class="tw"><table><tr><th>Function</th><th>Gives each row</th><th>On a tie</th><th>Reach for it when</th></tr>
        <tr><td><code>ROW_NUMBER()</code></td><td>1, 2, 3, … no repeats</td><td>Tied rows still get different numbers. Add a tie-breaker to ORDER BY to say which comes first</td><td>You need exactly N rows, or one row per group</td></tr>
        <tr><td><code>RANK()</code></td><td>its place, as in a race</td><td>Tied rows share a place and the next place is skipped: 1, 2, 2, 4</td><td>Ties should show, and "4th" should mean three rows are ahead</td></tr>
        <tr><td><code>DENSE_RANK()</code></td><td>its place, no gaps</td><td>Tied rows share a place and the next is not skipped: 1, 2, 2, 3</td><td>"The second highest value", counting distinct values</td></tr>
      </table></div>
      ${SQL(`SELECT first_name, last_name, orders,
  ROW_NUMBER() OVER (ORDER BY orders DESC, last_name) AS row_num,
  RANK()       OVER (ORDER BY orders DESC)            AS rnk,
  DENSE_RANK() OVER (ORDER BY orders DESC)            AS dense
FROM   orders_per_customer
ORDER BY row_num LIMIT 5;`)}
      ${RES(['last_name', 'orders', 'row_num', 'rnk', 'dense'], [['Bianchi', 10, 1, 1, 1], ['Nguyen', 7, 2, 2, 2], ['Rahimi', 7, 3, 2, 2], ['Callahan', 6, 4, 4, 3], ['Raman', 6, 5, 4, 3]], 'Two ties, three answers')}
      <ul>
        <li><b>ORDER BY inside OVER () is required</b>: it says what to rank by. The query's own ORDER BY only sorts the output. PARTITION BY restarts the numbering in each group.</li>
        <li>Asked for the second-longest film per genre with ROW_NUMBER, you get a film tied for first numbered 2. DENSE_RANK = 2 is the second-longest <i>length</i>, however many films share it. RANK would skip 2 altogether after a tie at 1.</li>
        <li>ROW_NUMBER without a tie-breaker can change from one run to the next. <code>ORDER BY rentals DESC, customer_id</code> fixes it.</li>
      </ul>` },
    { h: 'Why WHERE cannot see a window, and top N per group', b: `
      <div class="two">
        ${SQL(`SELECT first_name, orders,
       ROW_NUMBER() OVER (ORDER BY orders DESC) AS row_num
FROM   orders_per_customer
WHERE  row_num <= 2;
-- ERROR: column "row_num" does not exist`, 'bad')}
        ${SQL(`WITH ranked AS (
  SELECT first_name, orders,
         ROW_NUMBER() OVER (ORDER BY orders DESC) AS row_num
  FROM   orders_per_customer
)
SELECT first_name, orders, row_num
FROM   ranked
WHERE  row_num <= 2;`)}
      </div>
      <p>The order a query runs in: <b>FROM → WHERE → GROUP BY → HAVING → window functions → SELECT → ORDER BY → LIMIT.</b> WHERE runs before the window is computed, so there is no row_num yet. To filter on a window's result, finish the query first: that is what the CTE is for. The same order explains why <code>SUM(p.amount) OVER ()</code> in a grouped query fails: windows run after GROUP BY, when p.amount is gone. Group in a CTE, then window over its rows.</p>
      ${SQL(`-- Top N per group: aggregate; rank within each group; filter outside
WITH units_per_product AS (
  SELECT p.category, p.product_name, SUM(oi.units) AS units
  FROM   lecture.order_items oi
  JOIN   lecture.products p ON p.product_id = oi.product_id
  GROUP BY p.category, p.product_name
),
ranked AS (
  SELECT category, product_name, units,
         ROW_NUMBER() OVER (PARTITION BY category ORDER BY units DESC) AS rn
  FROM   units_per_product
)
SELECT category, product_name, units, rn
FROM   ranked
WHERE  rn <= 2
ORDER BY category, rn;   -- 8 rows: two per category`)}
      <p><code>rn = 1</code> is one row per group, such as a customer's latest order (<code>PARTITION BY customer_id ORDER BY rental_date DESC, rental_id DESC</code>). MAX(rental_date) alone would give the date but could not say which rental_id it belongs to. <code>DENSE_RANK() … = 2</code> is the second highest.</p>` },
    { h: 'Over time: LAG, LEAD and month-over-month', b: `
      ${SQL(`WITH monthly AS (
  SELECT CAST(DATE_TRUNC('month', o.order_date) AS date) AS month,
         SUM(oi.units * p.unit_price) AS revenue
  FROM   lecture.orders o
  JOIN   lecture.order_items oi ON oi.order_id = o.order_id
  JOIN   lecture.products p     ON p.product_id = oi.product_id
  GROUP BY month
),
with_prev AS (
  SELECT month, revenue,
         LAG(revenue) OVER (ORDER BY month) AS prev_month
  FROM   monthly
)
SELECT month, revenue, prev_month,
       revenue - prev_month AS change,
       ROUND(100 * (revenue - prev_month) / NULLIF(prev_month, 0), 1) AS pct_change
FROM   with_prev
ORDER BY month;`)}
      ${RES(['month', 'revenue', 'prev_month', 'change', 'pct_change'], [['2026-01-01', '3,731.70', null, null, null], ['2026-02-01', '3,906.20', '3,731.70', '174.50', '4.7'], ['2026-03-01', '5,495.55', '3,906.20', '1,589.35', '40.7']], 'February up 4.7% on January; March up 40.7% on February')}
      <ul>
        <li><code>LAG(x)</code> copies a value from the previous row onto this one; <code>LAG(x, 12)</code> reads 12 rows back; <code>LEAD(x)</code> reads the row after. <b>ORDER BY inside OVER says what "previous" means.</b></li>
        <li>The first row has no previous row, so its LAG is NULL. Correct, not a bug: there was no month before January. NULL spreads through the arithmetic, which is right.</li>
        <li>LAG in one step, arithmetic in the next: naming prev_month once beats writing the LAG three times. The same query on yearly rows is year-over-year change.</li>
        <li><b>LAG reads the previous row, not the previous month.</b> If March and April have no row, May's "previous month" is February. And a WHERE that removes February before LAG runs leaves March with no previous row: compute every month and the LAG in a CTE, then filter outside.</li>
      </ul>` },
    { h: 'Running totals and moving averages', b: `
      ${SQL(`SELECT order_date, revenue,
       SUM(revenue) OVER (ORDER BY order_date
                          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total,
       ROUND(AVG(revenue) OVER (ORDER BY order_date
                          ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2)    AS avg_7
FROM   daily
ORDER BY order_date;`)}
      <ul>
        <li>The <b>frame</b> picks the rows the SUM covers for each row: from the first row (UNBOUNDED PRECEDING) through this one (CURRENT ROW). Always write it out. The last running total is the period's total.</li>
        <li>Every word is a keyword: <code>ROWS BETWEEN start AND end</code>, where an end is UNBOUNDED PRECEDING, CURRENT ROW, UNBOUNDED FOLLOWING, or a count such as <code>6 PRECEDING</code>.</li>
        <li><b>A frame counts rows, not days.</b> Seven rows are seven days only if every day has a row. With no 8 March row, 9 March's "seven rows" span eight days. Start from the calendar and closed days come back as zeros, worth 0 in the average.</li>
        <li>The window for 1 June needs the six days before it, so the daily CTE must start in late May; filter to June in the outer query, after the average is computed. Filter first and 1 June's seven-day average is the average of one day.</li>
      </ul>` },
  ],
  cards: [
    ['What is the difference between GROUP BY and a window function?', 'GROUP BY collapses rows to one per group. A window function computes across rows but keeps every row, writing the answer beside each one.'],
    ['What does OVER () do?', 'Turns an aggregate into a window function: SUM(x) OVER () is the total of all rows, written onto every row.'],
    ['PARTITION BY', 'GROUP BY for a window: restarts the calculation for each group without collapsing rows. SUM(revenue) OVER (PARTITION BY category).'],
    ['ROW_NUMBER, RANK, DENSE_RANK on a tie', 'ROW_NUMBER: different numbers anyway (1 2 3 4 5). RANK: share a place, skip the next (1 2 2 4 4). DENSE_RANK: share a place, no gap (1 2 2 3 3).'],
    ['Why does WHERE row_num <= 3 fail, and how do you fix it?', 'Windows run after WHERE, so row_num does not exist yet. Put the numbering in a CTE and filter in the query after it.'],
    ['Top N per group recipe', 'Aggregate in a CTE; ROW_NUMBER() OVER (PARTITION BY group ORDER BY value DESC, tiebreaker) in a second CTE; WHERE rn <= N outside.'],
    ['Scalar subquery', 'A query in parentheses that returns one row and one column, used where a number would go: WHERE length > (SELECT AVG(length) FROM film).'],
    ['CTE (WITH)', 'WITH name AS (query) names a result so the rest of the statement uses it like a table. Several steps are separated by commas; each can read only the steps above it. Nothing is saved.'],
    ['Aggregate of an aggregate', 'Two groupings in one statement: group in a CTE (SUM per customer), then GROUP BY the result (COUNT per tier). One GROUP BY cannot do both.'],
    ['LAG and LEAD', 'LAG(x) copies the previous row\'s value onto this row; LEAD(x) the next row\'s. ORDER BY inside OVER defines previous. The first row\'s LAG is NULL.'],
    ['Month-over-month change', 'Monthly CTE; LAG(revenue) OVER (ORDER BY month) in a second CTE; revenue - prev and 100 * (revenue - prev) / NULLIF(prev, 0) outside.'],
    ['Running total frame', 'SUM(x) OVER (ORDER BY d ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).'],
    ['What is wrong with a seven-row moving average of daily sales?', 'A frame counts rows. If a day has no row, seven rows span more than seven days. Start from a calendar so every day has a row, 0 when closed.'],
    ['Why does SUM(p.amount) OVER () fail in a grouped query?', 'Windows run after GROUP BY, when the rows are one per group and p.amount no longer exists. Group in a CTE, then window over it.'],
    ['Why does LAG give February as May\'s previous month?', 'LAG reads the previous row. March and April have no rows, so February is the row before May. Use a calendar so every month has a row.'],
  ],
  quiz: [
    { t: 'mc', q: 'Five customers have 10, 7, 7, 6, 6 orders. What does RANK() OVER (ORDER BY orders DESC) give the fourth row?', o: ['3', '4', '2', '5'], a: 1, why: 'Ties share a place and the next place is skipped: 1, 2, 2, 4, 4. DENSE_RANK gives 1, 2, 2, 3, 3; ROW_NUMBER 1, 2, 3, 4, 5.' },
    { t: 'mc', q: 'Asked for the second-longest film in each genre, a colleague used ROW_NUMBER and kept rn = 2. In Action it returned a 184-minute film, the longest length in the genre. Why?', o: ['The sort was ascending', 'Two films tie at 184, and ROW_NUMBER numbered one of them 2', 'PARTITION BY was missing', 'LENGTH is text'], a: 1, why: 'ROW_NUMBER never ties. DENSE_RANK = 2 is the second-longest length however many films share it. RANK would skip 2 after a tie at 1.' },
    { t: 'mc', q: 'SELECT …, ROW_NUMBER() OVER (…) AS rn FROM film … WHERE rn <= 2 fails. Why?', o: ['ROW_NUMBER needs PARTITION BY', 'WHERE runs before window functions, so rn does not exist yet', 'rn is a reserved word', 'The alias needs quotes'], a: 1, why: 'Put the window in a WITH step and filter in the query after it.' },
    { t: 'mc', q: 'SELECT rating, SUM(amount), 100 * SUM(amount) / SUM(amount) OVER () FROM … GROUP BY rating fails: "p.amount must appear in the GROUP BY clause". Why?', o: ['Windows and GROUP BY cannot be in one query', 'Windows run after GROUP BY, when p.amount no longer exists', 'SUM cannot be nested', 'rating is not grouped'], a: 1, why: 'Group in a CTE (one row per rating), then SUM(revenue) OVER () over its rows. SUM(SUM(amount)) OVER () also works but is harder to read.' },
    { t: 'mc', q: 'Which query computes each store\'s share of each month\'s rentals?', o: ['100.0 * rentals / SUM(rentals) OVER ()', '100.0 * rentals / SUM(rentals) OVER (PARTITION BY month)', '100.0 * rentals / SUM(rentals) OVER (PARTITION BY store_id)', '100.0 * rentals / COUNT(*)'], a: 1, why: 'PARTITION BY month restarts the window per month so the two stores add to 100. The 100.0 keeps the decimals; 100 would give integer division and 0 on every row.' },
    { t: 'mc', q: 'March, April and May 2025 with the change from the month before. The monthly CTE filters WHERE rental_date >= \'2025-03-01\' and the LAG is in the same query. March\'s previous month is blank. Fix?', o: ['Use LEAD', 'Compute every month and the LAG in a CTE, then keep March to May outside', 'Use RANK', 'Add PARTITION BY month'], a: 1, why: 'Windows only see the rows that survive WHERE. February was removed before LAG ran.' },
    { t: 'mc', q: 'What is SUM(revenue) OVER (ORDER BY month ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) on the December row?', o: ['December\'s revenue', 'The year\'s total revenue', 'The average month', 'NULL'], a: 1, why: 'The frame runs from the first row through this one, so the last running total is the whole period.' },
    { t: 'mc', q: 'A seven-day moving average over a daily CTE built with GROUP BY order_date. The shop was closed on 8 March. What is 9 March\'s avg_7?', o: ['The average of 3 to 9 March', 'The average of seven order days spanning eight calendar days', 'NULL', 'An error'], a: 1, why: 'A frame counts rows. Start from the calendar so 8 March is a row worth 0, and 9 March averages 3 to 9 March.' },
    { t: 'mc', q: 'Each customer\'s most recent rental, with its rental_id. Which approach?', o: ['MAX(rental_date) GROUP BY customer_id', 'ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY rental_date DESC, rental_id DESC) in a CTE, then rn = 1', 'ORDER BY rental_date DESC LIMIT 1', 'DISTINCT customer_id'], a: 1, why: 'MAX gives the date but cannot say which rental_id it belongs to. Top 1 per group is the recipe. The rental_id tie-breaker handles two rentals at the same instant.' },
    { t: 'mc', q: 'A month-over-month report over the whole history shows May 2022 with a previous month of February 2022. Why?', o: ['LAG is sorted wrong', 'Nothing was rented in March or April, so those months have no row and LAG reads the row before', 'DATE_TRUNC skipped months', 'A time zone bug'], a: 1, why: 'LAG reads the previous row, not the previous month. A calendar table with LEFT JOIN would give every month a row, with 0.' },
    { t: 'mc', q: 'Put every paying customer into a spend tier and count the customers per tier. Why does this need a CTE?', o: ['CASE cannot be used with GROUP BY', 'The tier depends on a SUM per customer and the count is a GROUP BY on the tier: two groupings', 'COUNT needs DISTINCT', 'It does not'], a: 1, why: 'An aggregate of an aggregate. The CTE finishes the per-customer SUM; the outer query groups by the CASE on it. ORDER BY MIN(spend) sorts the tiers by money.' },
    { t: 'fill', q: 'The window function that copies the previous row\'s value onto this row is ______.', accept: ['lag'], why: 'LAG(x) OVER (ORDER BY …). LEAD reads the next row.' },
    { t: 'mc', q: 'ROW_NUMBER() OVER (PARTITION BY store_id ORDER BY rentals DESC) with two customers tied at 51. Without a tie-breaker, which one gets rn = 1?', o: ['The lower customer_id', 'The first inserted', 'Either; it can change from run to run', 'Both get 1'], a: 2, why: 'ROW_NUMBER must pick an order, and nothing says which. Add customer_id to the ORDER BY inside OVER.' },
    { t: 'short', q: 'Explain in two sentences how you would find the top three products by revenue in each category.', why: 'Step 1, a CTE that sums revenue per category and product. Step 2, a CTE that adds ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) as rn. Then SELECT from the second CTE WHERE rn <= 3 ORDER BY category, rn. The filter has to be outside because WHERE cannot see the window in the query that computes it.' },
  ],
},
];
