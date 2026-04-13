"use client";

import { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/docs")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch spec: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setSpec(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="docs-wrapper">
      {/* ── Header ── */}
      <header className="docs-header">
        <div className="docs-header-inner">
          <div className="docs-logo">
            <span className="docs-logo-icon">⚡</span>
            <span className="docs-logo-text">Shopix</span>
            <span className="docs-logo-badge">API Docs</span>
          </div>
          <p className="docs-header-sub">
            Complete OpenAPI 3.0 Documentation · v1.0.0
          </p>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="docs-main">
        {loading && (
          <div className="docs-loading">
            <div className="docs-spinner" />
            <p>Loading API specification…</p>
          </div>
        )}

        {error && (
          <div className="docs-error">
            <span className="docs-error-icon">⚠️</span>
            <p>
              <strong>Could not load spec:</strong> {error}
            </p>
          </div>
        )}

        {!loading && !error && spec && (
          <div className="swagger-container">
            <SwaggerUI
              spec={spec}
              docExpansion="list"
              defaultModelsExpandDepth={1}
              displayRequestDuration
              tryItOutEnabled={false}
              filter
            />
          </div>
        )}
      </main>

      {/* ── Inline scoped styles ── */}
      <style>{`
        /* ─── Reset / Base ─────────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #0f1117; }

        .docs-wrapper {
          min-height: 100vh;
          background: linear-gradient(160deg, #0f1117 0%, #141824 100%);
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
          color: #e2e8f0;
        }

        /* ─── Header ───────────────────────────────────────── */
        .docs-header {
          background: linear-gradient(90deg, #1a1f2e 0%, #1e2535 100%);
          border-bottom: 1px solid rgba(99, 102, 241, 0.25);
          padding: 0;
        }
        .docs-header-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px 32px;
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }
        .docs-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .docs-logo-icon {
          font-size: 1.6rem;
          filter: drop-shadow(0 0 8px #6366f1aa);
        }
        .docs-logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #818cf8, #6366f1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }
        .docs-logo-badge {
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.4);
          color: #a5b4fc;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .docs-header-sub {
          color: #64748b;
          font-size: 0.85rem;
          margin-left: auto;
        }

        /* ─── Main ─────────────────────────────────────────── */
        .docs-main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 32px 24px 64px;
        }

        /* ─── Loading ──────────────────────────────────────── */
        .docs-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 80px 0;
          color: #64748b;
        }
        .docs-spinner {
          width: 42px;
          height: 42px;
          border: 3px solid rgba(99, 102, 241, 0.15);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ─── Error ────────────────────────────────────────── */
        .docs-error {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 20px 24px;
          color: #fca5a5;
          margin: 40px 0;
        }
        .docs-error-icon { font-size: 1.4rem; }

        /* ─── Swagger Container ─────────────────────────────── */
        .swagger-container {
          border-radius: 16px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(99, 102, 241, 0.15),
            0 24px 80px rgba(0, 0, 0, 0.5);
        }

        /* ─── Swagger UI Theme Overrides ───────────────────── */

        /* Base wrapper */
        .swagger-ui { background: #141824 !important; }
        .swagger-ui .wrapper { padding: 0 !important; }

        /* Info section */
        .swagger-ui .info { background: #1a1f2e; border-bottom: 1px solid rgba(99,102,241,0.2); padding: 32px 32px 24px; margin: 0; }
        .swagger-ui .info .title { color: #c7d2fe !important; font-size: 1.8rem !important; font-weight: 800; }
        .swagger-ui .info p, .swagger-ui .info li { color: #94a3b8 !important; }
        .swagger-ui .info a { color: #818cf8 !important; }
        .swagger-ui .info .base-url { color: #64748b !important; }

        /* Servers / version */
        .swagger-ui .scheme-container { background: #1e2535 !important; border-bottom: 1px solid rgba(99,102,241,0.15); padding: 16px 32px; }
        .swagger-ui .servers > label { color: #94a3b8 !important; }
        .swagger-ui .servers select { background: #141824 !important; color: #e2e8f0 !important; border: 1px solid rgba(99,102,241,0.3) !important; border-radius: 8px !important; padding: 6px 10px; }

        /* Tag groups */
        .swagger-ui .opblock-tag { background: #1a1f2e !important; border-bottom: 1px solid rgba(99,102,241,0.15) !important; padding: 14px 20px; border-radius: 0 !important; }
        .swagger-ui .opblock-tag a { color: #c7d2fe !important; font-size: 1rem !important; font-weight: 700; }
        .swagger-ui .opblock-tag small { color: #64748b !important; font-size: 0.78rem; font-weight: 400; }
        .swagger-ui section h3 span { color: #c7d2fe !important; }

        /* Operation blocks */
        .swagger-ui .opblock { border-radius: 10px !important; margin: 6px 20px !important; border: 1px solid transparent !important; transition: all 0.2s ease; }
        .swagger-ui .opblock:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.3); }

        /* Method colours */
        .swagger-ui .opblock.opblock-get    { background: rgba(16, 185, 129, 0.06) !important; border-color: rgba(16, 185, 129, 0.25) !important; }
        .swagger-ui .opblock.opblock-post   { background: rgba(99, 102, 241, 0.07) !important; border-color: rgba(99, 102, 241, 0.3) !important; }
        .swagger-ui .opblock.opblock-put    { background: rgba(245, 158, 11, 0.07) !important; border-color: rgba(245, 158, 11, 0.25) !important; }
        .swagger-ui .opblock.opblock-patch  { background: rgba(14, 165, 233, 0.07) !important; border-color: rgba(14, 165, 233, 0.25) !important; }
        .swagger-ui .opblock.opblock-delete { background: rgba(239, 68, 68, 0.07) !important; border-color: rgba(239, 68, 68, 0.25) !important; }

        /* Method badge colours */
        .swagger-ui .opblock .opblock-summary-method { border-radius: 6px !important; font-weight: 700; font-size: 0.7rem; letter-spacing: 0.5px; min-width: 70px; }
        .swagger-ui .opblock.opblock-get    .opblock-summary-method { background: #10b981 !important; }
        .swagger-ui .opblock.opblock-post   .opblock-summary-method { background: #6366f1 !important; }
        .swagger-ui .opblock.opblock-put    .opblock-summary-method { background: #f59e0b !important; }
        .swagger-ui .opblock.opblock-patch  .opblock-summary-method { background: #0ea5e9 !important; }
        .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #ef4444 !important; }

        /* Operation summary text */
        .swagger-ui .opblock-summary-description { color: #cbd5e1 !important; font-size: 0.88rem; }
        .swagger-ui .opblock-summary-path        { color: #a5b4fc !important; font-family: 'Fira Mono', monospace; font-size: 0.88rem; }

        /* Expanded body */
        .swagger-ui .opblock-body        { background: #1a1f2e !important; }
        .swagger-ui .opblock-description { color: #94a3b8 !important; font-size: 0.86rem; padding: 12px 20px; }
        .swagger-ui table.headers td    { color: #94a3b8 !important; }

        /* Parameters */
        .swagger-ui .parameters-container, 
        .swagger-ui .responses-wrapper    { background: transparent !important; }
        .swagger-ui .parameter__name      { color: #a5b4fc !important; font-weight: 600; }
        .swagger-ui .parameter__in        { color: #64748b !important; font-size: 0.72rem; }
        .swagger-ui .parameter__type      { color: #34d399 !important; font-size: 0.72rem; }
        .swagger-ui .parameter__deprecated { color: #ef4444 !important; }
        .swagger-ui td.col.col_description p { color: #94a3b8 !important; font-size: 0.83rem; }

        /* Table rows */
        .swagger-ui tr:hover { background: rgba(99,102,241,0.05) !important; }

        /* Response codes */
        .swagger-ui .response-col_status { color: #34d399 !important; font-weight: 700; }
        .swagger-ui .response-col_description p,
        .swagger-ui .response-col_description li { color: #94a3b8 !important; font-size: 0.83rem; }
        .swagger-ui .response .response-col_links { color: #64748b !important; }

        /* Labels + inputs */
        .swagger-ui label { color: #94a3b8 !important; font-size: 0.82rem; }
        .swagger-ui input[type=text], .swagger-ui input[type=email], .swagger-ui textarea, .swagger-ui select {
          background: #0f1117 !important;
          color: #e2e8f0 !important;
          border: 1px solid rgba(99,102,241,0.3) !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
        }
        .swagger-ui input::placeholder { color: #475569 !important; }

        /* Buttons */
        .swagger-ui .btn { border-radius: 8px !important; font-weight: 600; font-size: 0.8rem; transition: all 0.2s; }
        .swagger-ui .btn.execute { background: #6366f1 !important; border-color: #6366f1 !important; color: #fff !important; }
        .swagger-ui .btn.execute:hover { background: #4f46e5 !important; }
        .swagger-ui .btn-clear { background: transparent !important; border: 1px solid rgba(239,68,68,0.4) !important; color: #ef4444 !important; }
        .swagger-ui .btn.try-out__btn { background: transparent !important; border: 1px solid rgba(99,102,241,0.4) !important; color: #818cf8 !important; }
        .swagger-ui .btn.try-out__btn:hover { background: rgba(99,102,241,0.1) !important; }
        .swagger-ui .btn.authorize { background: rgba(16,185,129,0.1) !important; border-color: rgba(16,185,129,0.5) !important; color: #34d399 !important; }
        .swagger-ui .btn.authorize:hover { background: rgba(16,185,129,0.2) !important; }

        /* Lock icon */
        .swagger-ui .authorization__btn svg, .swagger-ui .unlocked svg { fill: #34d399 !important; }
        .swagger-ui .locked svg { fill: #10b981 !important; }

        /* Models */
        .swagger-ui section.models { background: #1a1f2e !important; border-top: 1px solid rgba(99,102,241,0.15); }
        .swagger-ui section.models h4 { color: #c7d2fe !important; font-weight: 700; }
        .swagger-ui .model-container { background: #141824 !important; border: 1px solid rgba(99,102,241,0.15) !important; border-radius: 10px !important; }
        .swagger-ui .model .property.primitive { color: #34d399 !important; }
        .swagger-ui .model span { color: #94a3b8 !important; }
        .swagger-ui .model-title { color: #a5b4fc !important; font-weight: 600; }
        .swagger-ui .model-toggle:after { filter: invert(1); }
        .swagger-ui .json-schema-form-item .btn-add-item { color: #818cf8 !important; }

        /* Code highlight */
        .swagger-ui .highlight-code pre { background: #0f1117 !important; border-radius: 8px; }
        .swagger-ui .microlight { color: #e2e8f0 !important; font-size: 0.8rem; line-height: 1.6; }

        /* Filter input */
        .swagger-ui .filter-container .operation-filter-input {
          background: #1a1f2e !important;
          border: 1px solid rgba(99,102,241,0.25) !important;
          color: #e2e8f0 !important;
          border-radius: 8px !important;
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #141824; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.7); }

        /* Arrow / expand icons */
        .swagger-ui .arrow { filter: invert(0.7) sepia(1) saturate(3) hue-rotate(200deg); }

        /* Dividers */
        .swagger-ui .opblock-tag-section { border-bottom: 1px solid rgba(30,37,53,0.6); margin-bottom: 0; }
      `}</style>
    </div>
  );
}
