// // components/DNSResolver.js
"use client";

import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const DNSResolver = () => {
  const [domain, setDomain] = useState("");
  const [steps, setSteps] = useState([]);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleResolve = async () => {
    if (!domain) return;
    setLoading(true);
    setSteps([]);
    setRecord(null);
    setError(null);

    try {
      const response = await axios.post("/api/dns", { domain });
      setSteps(response.data.steps);

      if (response.data.error) {
        setError(response.data.error);
      } else {
        setRecord(response.data.record);
      }
    } catch (err) {
      setError("Error resolving domain.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">DNS Simulator</h2>

      {/* Input Section */}
      <div className="flex gap-4 mb-8">
        <input
          type="text"
          placeholder="Enter domain (e.g., example.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleResolve}
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Resolving..." : "Resolve"}
        </button>
      </div>

      {/* Visualization */}
      <div className="relative w-full aspect-[4/3] border rounded-lg bg-gray-50 mb-8">
        <svg className="w-full h-full " viewBox="0 0 800 600">
          {/* Arrow Markers */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
            </marker>
          </defs>

          {/* DNS Components */}
          {/* <g>
            

            <rect
              x="50"
              y="400"
              width="120"
              height="60"
              className='fill-white stroke-gray-800'
              rx="4"
            />
            <text
              x="110"
              y="430"
              className="text-sm text-center"
              textAnchor="middle"
            >
              Client
            </text>

          
            <rect
              x="250"
              y="200"
              width="140"
              height="120"
              className="fill-white stroke-gray-800"
              rx="4"
            />
            <text
              x="320"
              y="260"
              className="text-sm text-center"
              textAnchor="middle"
            >
              Recursive DNS Resolver
            </text>

        
            <rect
              x="500"
              y="50"
              width="120"
              height="60"
              className="fill-white stroke-gray-800"
              rx="4"
            />
            <text
              x="560"
              y="80"
              className="text-sm text-center"
              textAnchor="middle"
            >
              .ROOT Server
            </text> */}

          <g>
            {/* Client */}
            <rect
              x="50"
              y="400"
              width="120"
              height="60"
              className={`fill-white stroke-gray-800 ${
                error && steps[0].server === "client-to-resolver"
                  ? "fill-red-200"
                  : ""
              }`}
              rx="4"
            />
            <text
              x="110"
              y="430"
              className="text-sm text-center"
              textAnchor="middle"
            >
              Client
            </text>

            {/* Recursive Resolver */}
            <rect
              x="250"
              y="200"
              width="140"
              height="120"
              className={` stroke-gray-800 ${
                error && steps.some((step) => step.server.includes("resolver"))
                  ? "fill-red-200"
                  : "fill-white"
              } `}
              rx="4"
            />
            <text
              x="320"
              y="260"
              className="text-sm text-center"
              textAnchor="middle"
            >
              Recursive 
              DNS Resolver
            </text>

            {/* .ROOT Server */}
            <rect
              x="500"
              y="50"
              width="120"
              height="60"
              className={`fill-white stroke-gray-800 ${
                error &&
                steps.some((step) => step.server === "root-to-resolver")
                  ? "fill-red-200"
                  : ""
              }`}
              rx="4"
            />
            <text
              x="560"
              y="80"
              className="text-sm text-center"
              textAnchor="middle"
            >
              .ROOT Server
            </text>

            <rect
              x="500"
              y="200"
              width="120"
              height="60"
              className={`fill-white stroke-gray-800 ${
                error &&
                steps.some((step) => step.server === "tld-to-resolver")
                  ? "fill-red-200"
                  : ""
              }`}
              rx="4"
            />
            <text
              x="560"
              y="230"
              className="text-sm text-center"
              textAnchor="middle"
            >
              TLD Server
            </text>

            <rect
              x="500"
              y="350"
              width="120"
              height="60"
              className={`fill-white stroke-gray-800 ${
                error &&
                steps.some((step) => step.server === "auth-to-resolver")
                  ? "fill-red-200"
                  : ""
              }`}
              rx="4"
            />
            <text
              x="560"
              y="380"
              className="text-sm text-center"
              textAnchor="middle"
            >
              Auth Server
            </text>
          </g>

          {/* Animated Paths based on steps */}

          <AnimatePresence>
            {steps.map((step, index) => (
              <motion.path
                key={index}
                d={getPathForStep(step).data}
                stroke={
                  getPathForStep(step).type === "request"
                    ? "#FFA500"
                    : "#0000FF"
                }
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: index * 0.5 }}
              />
            ))}
          </AnimatePresence>
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-0.5 bg-orange-500"></div>
            <span className="text-sm">Request Query</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500"></div>
            <span className="text-sm">Response Query</span>
          </div>
        </div>
      </div>

      {/* Steps Display */}
      <div className="space-y-4">
        <AnimatePresence>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: index * 0.5 }}
              className="p-4 bg-white rounded-lg shadow-sm border"
            >
              <strong>{step.server}:</strong> {step.action}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      {/* DNS Record Display */}
      {record && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-8 p-6 bg-green-200 rounded-lg shadow-md"
        >
          <h3 className="text-xl font-semibold mb-4">DNS Record</h3>
          <div className="space-y-2">
            <p>
              <strong className="font-medium">Type:</strong>{" "}
              <span className="ml-2">{record.type}</span>
            </p>
            <p>
              <strong className="font-medium">Value:</strong>{" "}
              <span className="ml-2">{record.value}</span>
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

//  Helper function to get SVG path for each step
const getPathForStep = (step) => {
  const paths = {
    "client-to-resolver": { data: "M110,400 L250,260", type: "request" },
    "resolver-to-root": { data: "M390,220 L500,80", type: "request" },
    "root-to-resolver": { data: "M500,100 L390,240", type: "response" },
    "resolver-to-tld": { data: "M390,230 L500,230", type: "request" },
    "tld-to-resolver": { data: "M500,250 L390,250", type: "response" },
    "resolver-to-auth": { data: "M390,260 L500,350", type: "request" },
    "auth-to-resolver": { data: "M500,380 L390,280", type: "response" },
    "resolver-to-client": { data: "M250,280 L130,400", type: "response" },
  };

  return paths[step.server] || paths["client-to-resolver"];
};

export default DNSResolver;
