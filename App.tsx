import { useEffect } from 'react';

const pageMarkup = String.raw`<!-- preloader: the boulder rolls in, then becomes the hero stone -->
<div class="pre" id="pre" aria-hidden="true">
  <div class="pre-ball" id="preBall"><i class="pre-grain" id="preGrain"></i></div>
  <span class="pre-word">pushing</span>
  <span class="pre-count" id="preCount">000</span>
</div>

<div class="cur" id="cur" aria-hidden="true"><span>push</span></div>

<noscript><style>
  .pre{ display:none; }
  body.loading{ overflow:auto; }
  body.loading .hero .ch, body.loading .hero .wmzoom,
  body.loading .hero-meta, body.loading .hero-bottom,
  body.loading .hero-meta > *, body.loading .hero-bottom > *,
  body.loading .hero-sisy, body.loading .wm .l2 .fill{ animation-play-state:running; }
</style></noscript>

<!-- sisyphus, sketched once, used everywhere -->
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="sisy" viewBox="0 0 72 44">
    <path d="M2 41C18 35.4 33 29 47.5 22.8S64.5 14.6 70 12"/>
    <circle cx="56.4" cy="10.2" r="7"/>
    <circle cx="45.2" cy="8.8" r="2.3"/>
    <path d="M37 19.2Q40.5 15.5 43.5 12.8"/>
    <path d="M43.5 12.6Q47 10.6 50.2 9.6"/>
    <path d="M43.7 13.6Q47.2 14 50.5 13.9"/>
    <path d="M37 19Q33 24 29 29.4"/>
    <path d="M37 19Q39 22.5 38 25.7"/>
  </symbol>
</svg>

<header class="nav">
  <a class="logo" href="#top"><svg class="sisy" viewBox="0 0 72 44" aria-hidden="true" focusable="false"><use href="#sisy"/></svg><span>ABS<span class="hollow">U</span>RD</span></a>
  <nav class="nav-links">
    <a href="#about">About</a>
    <!-- <a href="#work">Work</a> -->
    <a href="#services">Services</a>
    <a href="#process">Process</a>
    <a href="#journey">Cases</a>
  </nav>
  <a class="line-btn" href="mailto:vesna.bozic.se@gmail.com?subject=Book%20a%20call%20%E2%80%94%20The%20Absurd%20Solution"><span class="cta-label">Start <span>a project</span></span><span class="ar">→</span></a>
</header>

<main id="top">

  <!-- HERO -->
  <section class="hero" id="hero">
    <div class="fog" style="opacity:.55" aria-hidden="true">
      <div class="blobc b1"></div>
      <div class="blobc b2"></div>
      <div class="blobc b3"></div>
    </div>
    <canvas class="stone" id="stone" aria-hidden="true"></canvas>
    <svg class="sisy hero-sisy" viewBox="0 0 72 44" aria-hidden="true" focusable="false"><use href="#sisy"/></svg>

    <div class="wm-wrap">
      <h1 class="wm" aria-label="The Absurd Solution">
        <span class="wmzoom">
        <span class="l1"><span class="in"><span class="ch" style="--i:0">T</span><span class="ch" style="--i:1">h</span><span class="ch" style="--i:2">e</span><span class="ch sp" style="--i:3">&nbsp;</span><span class="ch" style="--i:4">A</span><span class="ch" style="--i:5">b</span><span class="ch" style="--i:6">s</span><span class="ch" style="--i:7">u</span><span class="ch" style="--i:8">r</span><span class="ch" style="--i:9">d</span></span></span>
        <span class="l2"><span class="in"><span class="ch" style="--i:0">S</span><span class="ch" style="--i:1">o</span><span class="ch" style="--i:2">l</span><span class="ch" style="--i:3">u</span><span class="ch" style="--i:4">t</span><span class="ch" style="--i:5">i</span><span class="ch" style="--i:6">o</span><span class="ch" style="--i:7">n</span><span class="fill" aria-hidden="true">Solution</span></span></span>
        </span>
      </h1>
    </div>

    <div class="wrap hero-bottom">
      <div class="intro">
        <p>We engineer AI systems that finally match the&nbsp;ambition behind them.</p>
        <p>For teams whose production hasn't caught up to what they've promised.</p>
      </div>
      <span class="label">Production systems, end to end —<br>one independent practice.</span>
    </div>
    <div class="scrollcue" aria-hidden="true"><span>scroll</span><i></i></div>
  </section>

  <!-- STATEMENT -->
  <section class="statement" id="about">
    <div class="wrap">
      <p class="stmt-text" id="stmt">
        Most teams don't have an AI problem. They have a production problem — pilots
        that impress the room and stall in the backlog.
        <span class="break" aria-hidden="true"></span>
        That gap costs more than budget. It costs the certainty that the system
        will hold when it matters.
      </p>

      <div class="stat-row">
        <div class="stat reveal">
          <span class="big">50+</span>
          <p>Serverless functions running in production on a single platform</p>
        </div>
        <div class="stat reveal" style="--rd:.08s">
          <span class="big">4</span>
          <p>Model providers integrated in production — Claude, OpenAI, Gemini, Qwen</p>
        </div>
        <div class="stat reveal" style="--rd:.16s">
          <span class="big">2</span>
          <p>Regions served from one practice — EU &amp; GCC</p>
        </div>
      </div>
    </div>
  </section>

  <!-- TICKER -->
  <div class="ticker" aria-hidden="true">
    <div class="ticker-track">
      <span>production over demos</span><i>✳</i>
      <span>specs before code</span><i>✳</i>
      <span>evals over vibes</span><i>✳</i>
      <span>boring infrastructure, exciting results</span><i>✳</i>
      <span>one must imagine the system maintained</span><i>✳</i>
      <span>production over demos</span><i>✳</i>
      <span>specs before code</span><i>✳</i>
      <span>evals over vibes</span><i>✳</i>
      <span>boring infrastructure, exciting results</span><i>✳</i>
      <span>one must imagine the system maintained</span><i>✳</i>
    </div>
  </div>

  <!-- SERVICES -->
  <section class="sec" id="services">
    <div class="wrap">

      <div class="pt-intro reveal">
        <p class="pt-eyebrow">Senior AI/ML engineering, serverless architecture, and a sociologist's read of organizations — turned into systems that hold in production.</p>
        <div class="plumb" aria-hidden="true"></div>
        <p class="pt-state">The Absurd Solution is an independent AI engineering practice for the EU and GCC. Through spec-driven builds, evals and cost discipline, we take systems from first brief to production — and hand them over running. Everything listed below has shipped at least once.<span class="endsq" aria-hidden="true">✳</span></p>
      </div>

      <div class="pt-cols">
        <div class="reveal">
          <span class="chip-tag">[ what we do ]</span>
          <ul class="pt-list">
            <li style="--i:0"><i>01</i><span class="ti">Platform Engineering</span><span class="ds">identity, SSO &amp; multi-app suites</span></li>
            <li style="--i:1"><i>02</i><span class="ti">Applied AI Systems &amp; Integration</span></li>
            <li style="--i:2"><i>03</i><span class="ti">Retrieval &amp; Evaluation</span><span class="ds">RAG with privacy-first ingestion</span></li>
            <li style="--i:3"><i>04</i><span class="ti">Web Application Development</span><span class="ds">React &amp; Next.js, end to end</span></li>
            <li style="--i:4"><i>05</i><span class="ti">Product Design &amp; Design Systems</span></li>
            <li style="--i:5"><i>06</i><span class="ti">Document Intelligence &amp; Pipelines</span></li>
            <li style="--i:6"><i>07</i><span class="ti">Serverless Architecture &amp; DevOps on AWS</span></li>
            <li style="--i:7"><i>08</i><span class="ti">Workflow Automation &amp; Agents</span><span class="ds">n8n to production</span></li>
            <li style="--i:8"><i>09</i><span class="ti">Security &amp; Compliance Engineering</span><span class="ds">GDPR/DSR, audit trails</span></li>
            <li style="--i:9"><i>10</i><span class="ti">AI Strategy &amp; Adoption</span></li>
          </ul>
        </div>
        <div class="reveal" style="--rd:.1s">
          <span class="chip-tag">[ who we serve ]</span>
          <ul class="pt-list">
            <li style="--i:0">
              <span class="bq" aria-hidden="true"></span>Consultancies &amp; Professional Services
              <div class="pt-note">We build the systems behind the advice — proposal AI grounded in real methodology, governed knowledge hubs, and client-ready deliverables that ship.</div>
            </li>
            <li style="--i:1"><span class="ti">Product &amp; SaaS Teams</span></li>
            <li style="--i:2">
              <span class="bq" aria-hidden="true"></span>Operations-heavy SMEs with document workflows
              <div class="pt-note">Where the PDFs pile up: extraction pipelines with validation and human review built in — structured data out, headcount unchanged.</div>
            </li>
            <li style="--i:3"><span class="ti">Research &amp; Academic Organizations</span></li>
            <li style="--i:4"><span class="ti">Founders shipping their first AI feature</span></li>
          </ul>
        </div>
      </div>

    </div>
  </section>

  <!-- WORK (temporarily disabled)
  <section class="sec" id="work">
    <div class="mega-wrap"><h2 class="mega reveal">Selected <span class="ostroke">Work</span></h2><span class="mega-sub reveal">[ izabrani radovi ]</span></div>
    <div class="wrap">
      <div class="work-rows">
        <div class="wrow reveal">
          <div class="wmeta-col">
            <span class="windex" aria-hidden="true">01</span>
            <span class="kicker">[ selected work — 01 ]</span>
            <h3>Enterprise platform core — one login, nine products</h3>
            <span class="meta">Cognito · CDK · Next.js · Audit</span>
          </div>
          <div class="pwrap" data-cursor="case">
            <div class="panel" aria-hidden="true">
              <div class="ui ui-admin">
                <div class="u-side">
                  <span class="uidot"></span>
                  <span class="uibar md" style="width:72%"></span>
                  <span class="uibar" style="width:56%"></span>
                  <span class="uibar" style="width:64%"></span>
                  <span class="uibar" style="width:48%"></span>
                  <span class="uibar" style="width:58%"></span>
                </div>
                <div class="u-main">
                  <div class="u-top"><span class="uibar dk" style="width:120px"></span><span class="uibar" style="width:80px;margin-left:auto"></span></div>
                  <div class="u-rows">
                    <div class="u-row"><span class="uidot"></span><span class="uibar dk" style="width:26%"></span><span class="uibar" style="width:15%"></span><span class="chiplet ok" style="margin-left:auto">Active</span></div>
                    <div class="u-row"><span class="uidot"></span><span class="uibar dk" style="width:31%"></span><span class="uibar" style="width:12%"></span><span class="chiplet ok" style="margin-left:auto">Active</span></div>
                    <div class="u-row"><span class="uidot"></span><span class="uibar dk" style="width:22%"></span><span class="uibar" style="width:17%"></span><span class="chiplet wr" style="margin-left:auto">Expiring</span></div>
                    <div class="u-row"><span class="uidot"></span><span class="uibar dk" style="width:28%"></span><span class="uibar" style="width:14%"></span><span class="chiplet ok" style="margin-left:auto">Active</span></div>
                  </div>
                  <div class="u-tiles">
                    <span class="u-tile on"></span><span class="u-tile"></span><span class="u-tile"></span><span class="u-tile"></span><span class="u-tile"></span><span class="u-tile"></span><span class="u-tile"></span><span class="u-tile"></span><span class="u-tile"></span>
                  </div>
                </div>
              </div>
            </div>
            <div class="ovl"><p>Shared identity across 9+ product apps for a consulting firm: backend-mediated SSO where no auth tokens ever pass through the browser, central admin with per-product roles, access expiry and a full audit trail. New products inherit identity, hosting and CI/CD on day one.</p></div>
          </div>
        </div>

        <div class="wrow reveal" style="--rd:.06s">
          <div class="wmeta-col">
            <span class="windex" aria-hidden="true">02</span>
            <span class="kicker">[ selected work — 02 ]</span>
            <h3>Knowledge hub &amp; proposal AI</h3>
            <span class="meta">Bedrock · S3 Vectors · Office.js</span>
          </div>
          <div class="pwrap" data-cursor="case">
            <div class="panel" aria-hidden="true">
              <div class="ui ">
                <div class="u-chat">
                  <div class="bub u"><span class="uibar md" style="width:62%"></span></div>
                  <div class="bub u"><span class="uibar md" style="width:40%"></span></div>
                  <div class="bub"><span class="cl-dot"></span><div class="stack"><span class="uibar dk" style="width:88%"></span><span class="uibar" style="width:74%"></span><span class="uibar" style="width:80%"></span></div></div>
                  <div class="bub"><span class="cl-dot"></span><div class="stack"><span class="uibar" style="width:64%"></span><span class="uibar" style="width:52%"></span></div></div>
                </div>
                <div class="u-deck">
                  <div class="slide">
                    <span class="uibar dk" style="width:54%; height:10px"></span>
                    <span class="uibar" style="width:78%"></span>
                    <span class="uibar" style="width:70%"></span>
                    <span class="uibar" style="width:74%"></span>
                    <div class="mini-bars"><i style="height:40%"></i><i style="height:68%" class="dk"></i><i style="height:52%"></i><i style="height:90%" class="dk"></i><i style="height:60%"></i></div>
                  </div>
                  <div class="strip"><span class="sthumb on"></span><span class="sthumb"></span><span class="sthumb"></span></div>
                </div>
              </div>
            </div>
            <div class="ovl"><p>RAG over the firm's real methodology with privacy-first ingestion — PII redaction, NER, metric fuzzing — feeding a proposal engine that turns a short client brief into an on-brand deck with strict anti-fabrication guardrails. The same AI lives inside PowerPoint as an add-in, inserting fully editable slides faithful to the corporate template.</p></div>
          </div>
        </div>

        <div class="wrow reveal" style="--rd:.12s">
          <div class="wmeta-col">
            <span class="windex" aria-hidden="true">03</span>
            <span class="kicker">[ selected work — 03 ]</span>
            <h3>Nine apps, one design system</h3>
            <span class="meta">React · Design system · EN/AR</span>
          </div>
          <div class="pwrap" data-cursor="case">
            <div class="panel" aria-hidden="true">
              <div class="ui ui-grid">
                <span class="u-search"></span>
                <div class="tilegrid">
                  <div class="tile"><span class="uidot"></span><span class="uibar" style="width:64%"></span></div>
                  <div class="tile"><span class="uidot"></span><span class="uibar" style="width:52%"></span></div>
                  <div class="tile"><span class="uidot"></span><span class="uibar" style="width:70%"></span></div>
                  <div class="tile"><span class="uidot"></span><span class="uibar" style="width:58%"></span></div>
                  <div class="tile hot"><span class="uidot"></span><span class="uibar dk" style="width:66%"></span></div>
                  <div class="tile"><span class="uidot"></span><span class="uibar" style="width:48%"></span></div>
                  <div class="tile"><span class="uidot"></span><span class="uibar" style="width:62%"></span></div>
                  <div class="tile"><span class="uidot"></span><span class="uibar" style="width:56%"></span></div>
                  <div class="tile"><span class="uidot"></span><span class="uibar" style="width:68%"></span></div>
                </div>
              </div>
            </div>
            <div class="ovl"><p>Hub portal, project management, proposals, surveys, executive coaching, talent, challenges and network analysis — one shared UI shell and design system, bilingual-ready (EN/AR). Shared packages, E2E tests and a docs portal keep nine codebases coherent.</p></div>
          </div>
        </div>

        <div class="wrow reveal">
          <div class="wmeta-col">
            <span class="windex" aria-hidden="true">04</span>
            <span class="kicker">[ selected work — 04 ]</span>
            <h3>Catalog extraction pipeline</h3>
            <span class="meta">Docling · Vision LLMs · pgvector · AWS</span>
          </div>
          <div class="pwrap" data-cursor="case">
            <div class="panel" aria-hidden="true">
              <div class="ui ">
                <div class="u-doc">
                  <span class="uibar dk" style="width:46%"></span>
                  <span class="uibar" style="width:88%"></span>
                  <span class="uibar" style="width:82%"></span>
                  <div class="hl">
                    <span class="uibar md" style="width:76%"></span>
                    <span class="uibar md" style="width:58%"></span>
                  </div>
                  <span class="uibar" style="width:84%"></span>
                  <span class="uibar" style="width:70%"></span>
                  <span class="uibar" style="width:78%"></span>
                </div>
                <div class="u-form">
                  <div class="fgroup"><span class="uibar" style="width:24%"></span><div class="frow"><span class="uibar dk" style="width:46%"></span><span class="conf"><i style="width:92%"></i></span></div></div>
                  <div class="fgroup"><span class="uibar" style="width:30%"></span><div class="frow"><span class="uibar dk" style="width:38%"></span><span class="conf"><i style="width:88%"></i></span></div></div>
                  <div class="fgroup"><span class="uibar" style="width:20%"></span><div class="frow"><span class="uibar dk" style="width:52%"></span><span class="conf"><i style="width:96%"></i></span></div></div>
                  <div class="fgroup"><span class="uibar" style="width:26%"></span><div class="frow"><span class="uibar dk" style="width:34%"></span><span class="conf wr"><i style="width:41%"></i></span><span class="chiplet wr">Review</span></div></div>
                </div>
              </div>
            </div>
            <div class="ovl"><p>Multi-stage extraction — fetch, calibrate, scan, extract, match, flag — turning thousands of catalog pages into validated structured data. A calibration stage tunes extraction per catalog; low-confidence items route to human review instead of silently shipping.</p></div>
          </div>
        </div>

        <div class="wrow reveal" style="--rd:.06s">
          <div class="wmeta-col">
            <span class="windex" aria-hidden="true">05</span>
            <span class="kicker">[ selected work — 05 ]</span>
            <h3>Organizational network analysis platform</h3>
            <span class="meta">D3 · React · LLM summaries</span>
          </div>
          <div class="pwrap" data-cursor="case">
            <div class="panel" aria-hidden="true">
              <div class="ui ">
                <div class="u-graph">
                  <svg viewBox="0 0 260 200" aria-hidden="true">
                    <g stroke="rgba(0,0,0,.25)" stroke-width="1">
                      <line x1="50" y1="60" x2="110" y2="92"/><line x1="110" y1="92" x2="74" y2="150"/>
                      <line x1="110" y1="92" x2="172" y2="58"/><line x1="172" y1="58" x2="226" y2="92"/>
                      <line x1="172" y1="58" x2="150" y2="20"/><line x1="110" y1="92" x2="176" y2="142"/>
                      <line x1="176" y1="142" x2="226" y2="92"/><line x1="74" y1="150" x2="176" y2="142"/>
                      <line x1="50" y1="60" x2="92" y2="22"/><line x1="92" y1="22" x2="150" y2="20"/>
                      <line x1="30" y1="118" x2="74" y2="150"/><line x1="30" y1="118" x2="50" y2="60"/>
                    </g>
                    <g fill="#33322E">
                      <circle cx="50" cy="60" r="6"/><circle cx="110" cy="92" r="9"/><circle cx="74" cy="150" r="6"/>
                      <circle cx="172" cy="58" r="7"/><circle cx="226" cy="92" r="5"/><circle cx="150" cy="20" r="5"/>
                      <circle cx="176" cy="142" r="6"/><circle cx="92" cy="22" r="4"/><circle cx="30" cy="118" r="4"/>
                    </g>
                    <circle cx="110" cy="92" r="16" fill="none" stroke="#C26A50" stroke-width="1.5"/>
                  </svg>
                </div>
                <div class="u-read">
                  <span class="tinylab">AI readout</span>
                  <span class="uibar dk" style="width:84%"></span>
                  <span class="uibar" style="width:90%"></span>
                  <span class="uibar" style="width:76%"></span>
                  <span class="uibar" style="width:82%"></span>
                  <div class="legrow" style="margin-top:auto"><span class="uidot"></span><span class="uibar" style="width:46%"></span></div>
                  <div class="legrow"><span class="uidot" style="background:#C26A50"></span><span class="uibar" style="width:38%"></span></div>
                </div>
              </div>
            </div>
            <div class="ovl"><p>From survey ingestion to interactive network maps with AI-written readouts — making informal structure visible to the people running the formal one. Graph metrics, community detection, and plain-language summaries for leadership.</p></div>
          </div>
        </div>

        <div class="wrow reveal" style="--rd:.12s">
          <div class="wmeta-col">
            <span class="windex" aria-hidden="true">06</span>
            <span class="kicker">[ selected work — 06 ]</span>
            <h3>Istražimo — research survey platform</h3>
            <span class="meta">Next.js · Serverless · Statistics · EU residency</span>
          </div>
          <div class="pwrap" data-cursor="case">
            <div class="panel" aria-hidden="true">
              <div class="ui ui-stats">
                <div class="statsrow">
                  <div class="stat-c"><span class="uibar dk" style="width:52%; height:11px"></span><span class="uibar" style="width:70%"></span></div>
                  <div class="stat-c"><span class="uibar dk" style="width:44%; height:11px"></span><span class="uibar" style="width:64%"></span></div>
                  <div class="stat-c"><span class="uibar dk" style="width:58%; height:11px"></span><span class="uibar" style="width:60%"></span></div>
                </div>
                <svg viewBox="0 0 400 110" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0,86 L50,80 L100,84 L150,64 L200,70 L250,48 L300,42 L350,28 L400,22 L400,110 L0,110 Z" fill="rgba(0,0,0,.06)"/>
                  <polyline points="0,86 50,80 100,84 150,64 200,70 250,48 300,42 350,28 400,22" fill="none" stroke="#33322E" stroke-width="1.6"/>
                  <circle cx="400" cy="22" r="3.5" fill="#33322E"/>
                </svg>
                <div class="qrow">
                  <span class="tinylab">Response quality</span>
                  <span class="conf"><i style="width:86%"></i></span>
                  <span class="chiplet ok">EU residency</span>
                </div>
              </div>
            </div>
            <div class="ovl"><p>Academic survey platform for the Western Balkans: statistical analysis engine, response-quality scoring on every submission, 50+ Lambda functions, and EU data residency by design — models run on EU infrastructure end to end.</p></div>
          </div>
        </div>
      </div>
      <p class="work-note reveal">Client details under NDA — walkthroughs on request.</p>
    </div>
  </section>
  -->

  <!-- PROCESS -->
  <section class="sec" id="process">
    <div class="mega-wrap"><h2 class="mega reveal">The <span class="ostroke">Process</span></h2><span class="mega-sub reveal">[ kako radimo ]</span></div>
    <div class="wrap">
      <div class="procline reveal">
        <span class="pulse" aria-hidden="true"></span>
        <div class="pstep">
          <span class="pdot" aria-hidden="true"></span>
          <span class="pnum">[ 01 — diagnose ]</span>
          <h4>Find the real problem</h4>
          <p>A short audit of the workflow, the data and the bill — where AI pays off, and where it shouldn't be used at all.</p>
        </div>
        <div class="pstep">
          <span class="pdot" aria-hidden="true"></span>
          <span class="pnum">[ 02 — specify ]</span>
          <h4>Write it down first</h4>
          <p>A spec with acceptance criteria, agreed before any code. Ambiguity gets resolved on paper, where it's still cheap.</p>
        </div>
        <div class="pstep">
          <span class="pdot" aria-hidden="true"></span>
          <span class="pnum">[ 03 — build ]</span>
          <h4>Production-grade from week one</h4>
          <p>Small, shippable increments on real infrastructure. Demos happen along the way — never the destination.</p>
        </div>
        <div class="pstep">
          <span class="pdot" aria-hidden="true"></span>
          <span class="pnum">[ 04 — instrument ]</span>
          <h4>Measure it, hand it over</h4>
          <p>Evals, logging and cost tracking wired in and transferred — the system stays yours.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- CASE STUDIES -->
  <section class="sec" id="journey">
    <div class="mega-wrap"><h2 class="mega reveal">Case <span class="ostroke">Studies</span></h2><span class="mega-sub reveal">[ studije slučaja ]</span></div>
    <div class="wrap">
      <div class="cases">

        <div class="case reveal">
          <aside class="case-side">
            <span class="kicker">[ case — 01 ]</span>
            <div class="cfact"><span class="k">Industry</span><span class="v">Management consulting · GCC</span></div>
            <div class="cfact"><span class="k">Scope</span><span class="v">Identity &amp; SSO, product suite, AI layer</span></div>
            <div class="cfact"><span class="k">Stack</span><span class="v">AWS · Next.js · Bedrock · CDK</span></div>
            <div class="cstat"><b>9+</b><span>applications behind one login</span></div>
            <div class="cstat"><b>Days → min</b><span>proposal production time</span></div>
          </aside>
          <div class="case-body">
            <h3>One platform instead of scattered tools</h3>
            <h4>Challenge</h4>
            <p>A consulting firm ran on scattered tools and legacy apps — separate logins for everything, no central access control, proposals produced by hand, and institutional knowledge locked in hundreds of slide decks.</p>
            <h4>Solution</h4>
            <p>One platform on AWS. Shared identity and backend-mediated SSO put 9+ product apps behind a single account — no auth tokens in the browser, with roles, access expiry and audit in one admin panel. On top of it: a nine-app suite on one design system, and an AI layer — a governed knowledge hub with privacy-first ingestion, a proposal engine grounded in the firm's real methodology, and a PowerPoint add-in that edits decks in place. All of it infrastructure-as-code with CI/CD.</p>
            <h4>Results</h4>
            <p>9+ applications behind one login with centrally managed, auditable access. Proposal production went from days to minutes — on-brand by construction. And the platform pattern means a new product ships in days: identity, hosting, CI/CD and the design system are already there.</p>
          </div>
        </div>

        <div class="case reveal">
          <aside class="case-side">
            <span class="kicker">[ case — 02 ]</span>
            <div class="cfact"><span class="k">Industry</span><span class="v">Auctions &amp; e-commerce</span></div>
            <div class="cfact"><span class="k">Scope</span><span class="v">Extraction pipeline &amp; review tooling</span></div>
            <div class="cfact"><span class="k">Stack</span><span class="v">Docling · Vision LLMs · pgvector · AWS</span></div>
            <div class="cstat"><b>6</b><span>pipeline stages, fetch → flag</span></div>
            <div class="cstat"><b>100%</b><span>of low-confidence items routed to human review</span></div>
          </aside>
          <div class="case-body">
            <h3>From PDF catalogs to validated data</h3>
            <h4>Challenge</h4>
            <p>Auction catalogs arrive as inconsistent PDFs — every house formats differently, and turning thousands of pages into usable records meant slow, error-prone manual entry.</p>
            <h4>Solution</h4>
            <p>A multi-stage pipeline — fetch, calibrate, scan, extract, match, flag. A calibration stage tunes extraction to each catalog instead of forcing one brittle template; vision models read the pages, results are matched against reference data, and anything below the confidence bar is flagged for human review instead of silently shipping.</p>
            <h4>Results</h4>
            <p>Validated, structured data at scale, with review effort concentrated exactly where the models are uncertain. The pipeline runs serverless end to end, so cost follows volume — and quality is measured, not assumed.</p>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- ABOUT -->
  <section class="sec" id="about-2">
    <div class="wrap about-grid">
      <p class="reveal">
        The Absurd Solution is an independent AI engineering practice with a research
        background in sociology — systems get read as organizations, not just code.
        Implementation-first by conviction: production AI systems, serverless platforms
        and automation for consultancies and product teams across the EU and GCC.
      </p>
      <div class="facts reveal" style="--rd:.1s">
        <div class="fact"><span class="k">Base</span><span class="v">Novi Sad, Serbia · CET</span></div>
        <div class="fact"><span class="k">Languages</span><span class="v">SR · EN · ES · IT</span></div>
        <div class="fact"><span class="k">Stack</span><span class="v">Python · TypeScript · AWS</span></div>
        <div class="fact"><span class="k">Tooling</span><span class="v">Claude Code · n8n · CDK</span></div>
      </div>
    </div>
  </section>

  <!-- OUTRO -->
  <section class="outro" id="outro">
    <div class="fog" aria-hidden="true">
      <div class="blobc b1" style="top:auto;bottom:-30%;left:-8%"></div>
      <div class="blobc b2" style="top:auto;bottom:-10%"></div>
    </div>
    <div class="halftone" style="-webkit-mask-image:radial-gradient(120% 100% at 40% 80%, #000 20%, transparent 75%); mask-image:radial-gradient(120% 100% at 40% 80%, #000 20%, transparent 75%)" aria-hidden="true"></div>

    <div class="wrap">
      <h2 class="outro-head reveal">
        <span>Let's <span class="ostroke">build</span></span>
        <span class="i1">the <span class="ostroke">system</span></span>
        <span class="i2">that <span class="ostroke">survives</span></span>
        <span class="i3"><span class="arw">→</span>production</span>
      </h2>
      <a class="cta-line reveal" style="--rd:.1s" href="mailto:vesna.bozic.se@gmail.com?subject=Book%20a%20call%20%E2%80%94%20The%20Absurd%20Solution">Tell us the problem <span class="ar">→</span></a>
      <div class="outro-meta reveal" style="--rd:.16s">
        <span>( Novi Sad — CET )</span>
        <span>( EU &amp; GCC )</span>
        <span>( Remote-first )</span>
      </div>
      <a class="email reveal" style="--rd:.2s" href="mailto:vesna.bozic.se@gmail.com">vesna.bozic.se@gmail.com</a>
    </div>
  </section>

</main>

<footer>
  <div class="foot-top">
    <a class="logo" href="#top"><svg class="sisy" viewBox="0 0 72 44" aria-hidden="true" focusable="false"><use href="#sisy"/></svg><span>ABS<span class="hollow">U</span>RD</span></a>
    <nav class="foot-links">
      <a href="#about">About</a>
      <!-- <a href="#work">Work</a> -->
      <a href="#services">Services</a>
      <a href="#process">Process</a>
    <a href="#journey">Cases</a>
      <a href="mailto:vesna.bozic.se@gmail.com">Contact</a>
    </nav>
    <span class="foot-copy">© 2026 The Absurd Solution · Novi Sad</span>
  </div>
  <div class="foot-mark" aria-hidden="true">
    <h2>ABS<span class="hollow">U</span>RD</h2>
  </div>
</footer>`;

const pageScripts = [
  String.raw`(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* reveal on scroll */
  var els = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)){
    els.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold:.16 });
    els.forEach(function(el){ io.observe(el); });
  }

  /* scroll-lit statement */
  var stmt = document.getElementById('stmt');
  if (!stmt) return;
  var nodes = Array.prototype.slice.call(stmt.childNodes);
  stmt.textContent = '';
  nodes.forEach(function(node){
    if (node.nodeType === 3){
      node.textContent.split(/(\s+)/).forEach(function(part){
        if (part === '') return;
        if (/^\s+$/.test(part)){ stmt.appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement('span');
        w.className = 'w';
        w.textContent = part;
        stmt.appendChild(w);
      });
    } else {
      stmt.appendChild(node);
    }
  });
  var words = stmt.querySelectorAll('.w');
  if (reduced){
    words.forEach(function(w){ w.classList.add('lit'); });
    return;
  }
  var ticking = false;
  function updateLit(){
    var r = stmt.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh * 0.85 - r.top) / (r.height + vh * 0.45);
    p = Math.max(0, Math.min(1, p));
    var lit = Math.floor(p * words.length * 1.08);
    words.forEach(function(w, i){ w.classList.toggle('lit', i < lit); });
    ticking = false;
  }
  window.addEventListener('scroll', function(){
    if (!ticking){ ticking = true; requestAnimationFrame(updateLit); }
  }, { passive:true });
  updateLit();
})();`,
  String.raw`/* ---------- hero: zoom-through scroll, tilt, skew, flashlight ---------- */
(function(){
  /* guarantee the wordmark fits: measure after fonts load, shrink if it overflows */
  function fitWm(){
    ['.wm .l1', '.wm .l2'].forEach(function(sel){
      var el = document.querySelector(sel);
      if (!el) return;
      var inner = el.querySelector('.in');
      if (!inner) return;
      el.style.fontSize = '';
      var avail = el.clientWidth;
      var w = inner.scrollWidth;
      if (w > avail){
        var cur = parseFloat(getComputedStyle(el).fontSize);
        el.style.fontSize = (cur * avail / w * .99) + 'px';
      }
    });
  }
  if (document.fonts && document.fonts.ready){ document.fonts.ready.then(fitWm); }
  fitWm();
  window.addEventListener('resize', fitWm);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var wm = document.querySelector('.wm');
  var hero = document.querySelector('.hero');
  if (!wm || !hero) return;

  var sk = 0, last = window.scrollY, raf = null, active = true;
  var rx = 0, ry = 0, trx = 0, tryy = 0;

  if (window.matchMedia('(pointer:fine)').matches){
    hero.addEventListener('pointermove', function(e){
      trx = ((e.clientY / window.innerHeight) - .5) * -2.4;
      tryy = ((e.clientX / window.innerWidth) - .5) * 2.8;
    });
    hero.addEventListener('pointerleave', function(){ trx = 0; tryy = 0; });
  }

  function frame(){
    var y = window.scrollY, vh = window.innerHeight;
    var vel = y - last; last = y;
    var tgt = Math.max(-3.5, Math.min(3.5, vel * .09));
    sk += (tgt - sk) * .14;
    rx += (trx - rx) * .08;
    ry += (tryy - ry) * .08;
    var p = Math.min(1, y / (vh * .92));
    var sc = 1 + p * 3.6;
    wm.style.transform =
      'perspective(900px) translateY(' + (y * .1).toFixed(1) + 'px)' +
      ' scale(' + sc.toFixed(4) + ')' +
      ' skewY(' + sk.toFixed(3) + 'deg)' +
      ' rotateX(' + rx.toFixed(3) + 'deg) rotateY(' + ry.toFixed(3) + 'deg)';
    wm.style.opacity = (1 - p).toFixed(3);
    var settled = Math.abs(sk) < .02 && Math.abs(rx - trx) < .02 && Math.abs(ry - tryy) < .02;
    if (active || !settled){ raf = requestAnimationFrame(frame); } else { raf = null; }
  }

  new IntersectionObserver(function(en){
    active = en[0].isIntersecting;
    if (active && !raf) raf = requestAnimationFrame(frame);
  }, { threshold:0 }).observe(hero);

  window.addEventListener('scroll', function(){ if (!raf) raf = requestAnimationFrame(frame); }, { passive:true });
  raf = requestAnimationFrame(frame);

  var lin = document.querySelector('.wm .l2 .in');
  if (lin && window.matchMedia('(pointer:fine)').matches){
    hero.addEventListener('pointermove', function(e){
      var r = lin.getBoundingClientRect();
      lin.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      lin.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
    hero.addEventListener('pointerleave', function(){
      lin.style.setProperty('--mx', '-999px');
      lin.style.setProperty('--my', '-999px');
    });
  }
})();`,
  String.raw`/* ---------- preloader: the boulder rolls in, grows, becomes the hero stone ---------- */
(function(){
  var pre = document.getElementById('pre');
  var ball = document.getElementById('preBall');
  var grainEl = document.getElementById('preGrain');
  var cnt = document.getElementById('preCount');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finished = false;
  function finish(){
    if (finished) return;
    finished = true;
    document.body.classList.remove('loading');
    if (pre){ pre.classList.add('done'); }
    window.dispatchEvent(new Event('absurd:ready'));
  }
  if (!pre || !ball || reduced || window.scrollY > 8){ finish(); return; }
  var hero = document.querySelector('.hero');
  var hw = hero ? hero.clientWidth : window.innerWidth;
  var hh = hero ? hero.clientHeight : window.innerHeight;
  var stoneScale = window.matchMedia('(max-width: 360px)').matches ? .26 : (window.matchMedia('(max-width: 560px)').matches ? .31 : .39);
  var R = Math.min(hw, hh) * stoneScale;
  var d0 = 64;
  var tx = hw * .5 + Math.sin(3.5) * hw * .27;   /* the stone's first frame, mirrored */
  var ty = hh * .47 + Math.sin(1.2) * hh * .07;
  var x0 = -d0 * 2;
  var ROLL = 1150, GROW = 520, t0 = performance.now();
  function easeIO(t){ return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function easeO(t){ return 1 - Math.pow(1 - t, 3); }
  function frame(now){
    if (finished) return;
    var t = now - t0;
    if (t <= ROLL){
      var k = easeIO(Math.min(1, t / ROLL));
      var x = x0 + (tx - x0) * k;
      ball.style.transform = 'translate(' + (x - d0 / 2) + 'px,' + (ty - d0 / 2) + 'px)';
      if (grainEl){ grainEl.style.transform = 'rotate(' + ((x - x0) / (3.1416 * d0) * 360) + 'deg)'; }
      if (cnt){ cnt.textContent = ('00' + Math.round(k * 100)).slice(-3); }
    } else if (t <= ROLL + GROW){
      var k2 = easeO((t - ROLL) / GROW);
      var dia = d0 + (R * 2 - d0) * k2;
      ball.style.width = dia + 'px';
      ball.style.height = dia + 'px';
      ball.style.transform = 'translate(' + (tx - dia / 2) + 'px,' + (ty - dia / 2) + 'px)';
      if (cnt){ cnt.textContent = '100'; }
    } else { finish(); return; }
    requestAnimationFrame(frame);
  }
  setTimeout(finish, 4000);
  requestAnimationFrame(frame);
})();`,
  String.raw`/* ---------- custom cursor: a dot that inverts whatever it crosses ---------- */
(function(){
  var fine = window.matchMedia('(pointer:fine)').matches;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = document.getElementById('cur');
  if (!fine || reduced || !cur) return;
  document.documentElement.classList.add('has-cur');
  var x = -100, y = -100, px = -100, py = -100;
  var lab = cur.querySelector('span');
  window.addEventListener('pointermove', function(e){
    px = e.clientX; py = e.clientY;
    var t = e.target;
    var link = t && t.closest ? t.closest('a, button') : null;
    var tag = t && t.closest ? t.closest('[data-cursor]') : null;
    cur.classList.toggle('on-link', !!link);
    cur.classList.toggle('on-tag', !!tag);
    if (lab){ lab.textContent = tag ? tag.getAttribute('data-cursor') : 'push'; }
  }, { passive:true });
  window.addEventListener('pointerdown', function(){ cur.classList.add('down'); });
  window.addEventListener('pointerup', function(){ cur.classList.remove('down'); });
  document.documentElement.addEventListener('mouseleave', function(){ cur.classList.add('hid'); });
  document.documentElement.addEventListener('mouseenter', function(){ cur.classList.remove('hid'); });
  (function tick(){
    x += (px - x) * .22;
    y += (py - y) * .22;
    cur.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%)';
    requestAnimationFrame(tick);
  })();
})();`,
  String.raw`/* ---------- work panels: gentle parallax depth on scroll ---------- */
(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  var uis = Array.prototype.slice.call(document.querySelectorAll('.pwrap .ui'));
  if (!uis.length) return;
  var ticking = false;
  function update(){
    ticking = false;
    var vh = window.innerHeight;
    for (var i = 0; i < uis.length; i++){
      var r = uis[i].parentElement.getBoundingClientRect();
      if (r.bottom < -60 || r.top > vh + 60) continue;
      var prog = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      uis[i].style.transform = 'translateY(' + (prog * r.height * .035).toFixed(2) + 'px) scale(1.08)';
    }
  }
  function onScroll(){ if (!ticking){ ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onScroll, { passive:true });
  update();
})();`,
  String.raw`/* ---------- hero: black stone — drifts right & left as before; shove it and it returns ---------- */
(function(){
  var cv = document.getElementById('stone');
  var hero = document.querySelector('.hero');
  if (!cv || !hero || !cv.getContext) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer:fine)').matches;
  var ctx = cv.getContext('2d');
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var curEl = document.getElementById('cur');
  var W = 0, H = 0;

  /* the wander is the original sine drift; pushing only adds a horizontal
     offset on top of it, and a damped spring always brings that back to 0 */
  var off = 0, offV = 0, vEst = 0, dragX = 0, grabDX = 0, lastX = null;
  var mode = 'idle';                 /* idle | drag | glide */
  var rot = 0;                       /* rolling rotation of the grain */
  var sc = 1, scT = 1;               /* it shrinks under the effort of being pushed */

  function stoneScale(){ return window.matchMedia('(max-width: 360px)').matches ? .26 : (window.matchMedia('(max-width: 560px)').matches ? .31 : .39); }
  function radius(){ return Math.min(W, H) * stoneScale(); }
  function driftX(){ return W * .5 + Math.sin(T * .00009 + 3.5) * W * .27; }
  function driftY(){ return H * .47 + Math.sin(T * .00014 + 1.2) * H * .07; }
  function ballX(){ return driftX() + off; }

  function resize(){
    var r = cv.getBoundingClientRect();
    var ow = W || 0;
    W = Math.max(2, Math.round(r.width * DPR));
    H = Math.max(2, Math.round(r.height * DPR));
    cv.width = W; cv.height = H;
    if (ow){ off *= W / ow; }
    lastX = null;
  }
  resize();
  window.addEventListener('resize', function(){ resize(); if (reduced) draw(0); });

  /* grain tile: built once, tiled over the orb every frame */
  var grain = document.createElement('canvas');
  grain.width = grain.height = 128;
  (function(){
    var gx = grain.getContext('2d');
    var id = gx.createImageData(128, 128);
    var d = id.data;
    for (var i = 0; i < d.length; i += 4){
      var nv = (Math.random() * 255) | 0;
      d[i] = d[i + 1] = d[i + 2] = nv;
      d[i + 3] = 255;
    }
    gx.putImageData(id, 0, 0);
  })();
  var grainPat = ctx.createPattern(grain, 'repeat');

  /* light follows the cursor */
  var T = 0, mx = 0, my = 0, tmx = 0, tmy = 0;
  if (fine && !reduced){
    hero.addEventListener('pointermove', function(e){
      tmx = (e.clientX / window.innerWidth - .5) * 1.0;
      tmy = (e.clientY / window.innerHeight - .5) * .65;
    });
    hero.addEventListener('pointerleave', function(){ tmx = 0; tmy = 0; if (curEl){ curEl.classList.remove('on-stone'); curEl.classList.remove('grabbing'); } });
  }

  /* sisyphus mode: grab the boulder and it shrinks under the strain; it only
     moves right and left; let it go and it always wanders back. */
  function toLocal(e){
    var r = cv.getBoundingClientRect();
    return { x:(e.clientX - r.left) * DPR, y:(e.clientY - r.top) * DPR };
  }
  function overStone(p){
    return Math.hypot(p.x - ballX(), p.y - driftY()) <= radius() * sc;
  }
  if (fine && !reduced){
    hero.addEventListener('pointerdown', function(e){
      var p = toLocal(e);
      if (!overStone(p)) return;
      mode = 'drag';
      grabDX = ballX() - p.x;
      dragX = ballX();
      vEst = 0;
      scT = .88;
      if (curEl){ curEl.classList.add('grabbing'); }
      if (hero.setPointerCapture){ try{ hero.setPointerCapture(e.pointerId); }catch(_e){} }
      e.preventDefault();
    });
    hero.addEventListener('pointermove', function(e){
      var p = toLocal(e);
      if (mode === 'drag'){
        dragX = Math.min(W * .90, Math.max(W * .10, p.x + grabDX));
      } else {
        if (curEl){ curEl.classList.toggle('on-stone', overStone(p)); }
      }
    });
    var release = function(){
      if (mode !== 'drag') return;
      mode = 'glide';
      offV = Math.max(-W * .0015, Math.min(W * .0015, vEst));
      scT = 1;
      if (curEl){ curEl.classList.remove('grabbing'); }
    };
    hero.addEventListener('pointerup', release);
    hero.addEventListener('pointercancel', release);
  }

  function draw(dt){
    T += dt;
    mx += (tmx - mx) * .05;
    my += (tmy - my) * .05;
    sc += (scT - sc) * Math.min(1, dt * .012);

    /* horizontal only: drag pins it to the pointer, release springs it
       back into the drift */
    if (mode === 'drag'){
      var tOff = dragX - driftX();
      off += (tOff - off) * Math.min(1, dt * .02);
    } else if (mode === 'glide'){
      offV += (-.000004 * off - .004 * offV) * dt;
      off += offV * dt;
      if (Math.abs(off) < W * .0004 && Math.abs(offV) < W * .00002){
        off = 0; offV = 0; mode = 'idle';
      }
    }

    var cx0 = ballX();
    var cy0 = driftY();
    var R = radius() * sc;
    if (lastX === null){ lastX = cx0; }
    rot += (cx0 - lastX) / Math.max(1, R);
    if (dt > 0){ vEst += ((cx0 - lastX) / dt - vEst) * .25; }
    lastX = cx0;

    var lx = -.45 + mx * .6, ly = -.55 + my * .6;
    var ll = Math.hypot(lx, ly) || 1;
    if (ll > .82){ lx = lx / ll * .82; ly = ly / ll * .82; }
    var ul = Math.hypot(lx, ly) || 1;
    var ux = lx / ul, uy = ly / ul;
    ctx.clearRect(0, 0, W, H);

    /* body: offset radial gradient = sphere volume */
    var hx = cx0 + lx * R, hy = cy0 + ly * R;
    var g = ctx.createRadialGradient(hx, hy, R * .04, hx, hy, R * 1.9);
    g.addColorStop(0, 'rgb(96,88,78)');
    g.addColorStop(.32, 'rgb(38,38,38)');
    g.addColorStop(.62, 'rgb(15,15,15)');
    g.addColorStop(1, 'rgb(5,5,5)');
    ctx.beginPath();
    ctx.arc(cx0, cy0, R, 0, 6.2832);
    ctx.fillStyle = g;
    ctx.fill();

    /* grain: clipped to the circle, rolling with the stone like material */
    if (grainPat){
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx0, cy0, R, 0, 6.2832);
      ctx.clip();
      ctx.translate(cx0, cy0);
      ctx.rotate(rot);
      ctx.scale(DPR, DPR);
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = grainPat;
      var rc = R / DPR + 2;
      /* texture in the mids + highlight */
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = .5;
      ctx.fillRect(-rc, -rc, rc * 2, rc * 2);
      /* faint speckle so the grain survives on the shadow side */
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = .05;
      ctx.fillRect(-rc, -rc, rc * 2, rc * 2);
      ctx.restore();
    }

    /* faint rim light on the shadow limb, so it reads as a ball, not a dot */
    var sx2 = cx0 - ux * R, sy2 = cy0 - uy * R;
    var rg = ctx.createRadialGradient(sx2, sy2, 0, sx2, sy2, R * 1.05);
    rg.addColorStop(0, 'rgba(185,82,38,.34)');
    rg.addColorStop(.55, 'rgba(185,82,38,.09)');
    rg.addColorStop(1, 'rgba(185,82,38,0)');
    ctx.beginPath();
    ctx.arc(cx0, cy0, R - .75, 0, 6.2832);
    ctx.strokeStyle = rg;
    ctx.lineWidth = 1.5 * DPR;
    ctx.stroke();
  }

  if (reduced){ draw(0); return; }
  var run = true, armed = false, lastT = performance.now();
  function loop(now){
    if (!run || !armed) return;
    var dt = Math.min(50, now - lastT); lastT = now;
    draw(dt);
    requestAnimationFrame(loop);
  }
  new IntersectionObserver(function(en){
    run = en[0].isIntersecting;
    if (run && armed){ lastT = performance.now(); requestAnimationFrame(loop); }
  }, { threshold:0 }).observe(hero);
  function start(){
    if (armed) return;
    armed = true; lastT = performance.now();
    requestAnimationFrame(loop);
  }
  if (document.body.classList.contains('loading')){
    window.addEventListener('absurd:ready', start, { once:true });
    setTimeout(start, 4500);
  } else { start(); }
})();`,
  String.raw`/* ---------- in-page navigation (works even where hash links are blocked) ---------- */
(function(){
  var smooth = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      var id = a.getAttribute('href').slice(1);
      var el = id ? document.getElementById(id) : null;
      if (el){ el.scrollIntoView({ behavior: smooth, block: 'start' }); }
      else { window.scrollTo({ top: 0, behavior: smooth }); }
    });
  });
})();`
];

const App: React.FC = () => {
  useEffect(() => {
    document.body.classList.add('loading');
    document.documentElement.classList.remove('has-cur');

    const mountedScripts = pageScripts.map((code) => {
      const script = document.createElement('script');
      script.dataset.absurdRuntime = 'true';
      script.textContent = code;
      document.body.appendChild(script);
      return script;
    });

    return () => {
      mountedScripts.forEach((script) => script.remove());
      document.body.classList.remove('loading');
      document.documentElement.classList.remove('has-cur');
    };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: pageMarkup }} />;
};

export default App;
