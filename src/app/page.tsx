"use client";

import { useState } from "react";

type Agent = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
};

const AGENTS: Agent[] = [
  {
    id: "research",
    name: "Research Agent",
    description: "情報収集・調査を行います",
    icon: "🔍",
    color: "bg-blue-500",
  },
  {
    id: "summary",
    name: "Summary Agent",
    description: "テキストを要約します",
    icon: "📝",
    color: "bg-green-500",
  },
  {
    id: "factcheck",
    name: "FactCheck Agent",
    description: "事実確認・検証を行います",
    icon: "✓",
    color: "bg-yellow-500",
  },
  {
    id: "writer",
    name: "Writer Agent",
    description: "文章を作成します",
    icon: "✍️",
    color: "bg-purple-500",
  },
];

type Message = {
  role: "user" | "assistant";
  content: string;
  agent?: string;
};

type PipelineStep = {
  agentId: string;
  status: "pending" | "processing" | "done" | "error";
  output?: string;
};

export default function Home() {
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pipeline, setPipeline] = useState<PipelineStep[]>([]);

  const toggleAgent = (agentId: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  };

  const runPipeline = async () => {
    if (!input.trim() || selectedAgents.length === 0) return;

    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: input }]);

    const steps: PipelineStep[] = selectedAgents.map((agentId) => ({
      agentId,
      status: "pending" as const,
    }));
    setPipeline(steps);

    let currentInput = input;
    const newMessages: Message[] = [];

    for (let i = 0; i < selectedAgents.length; i++) {
      const agentId = selectedAgents[i];
      setPipeline((prev) =>
        prev.map((step, idx) =>
          idx === i ? { ...step, status: "processing" } : step
        )
      );

      try {
        const response = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId, input: currentInput }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Agent error");
        }

        currentInput = data.output;
        const agent = AGENTS.find((a) => a.id === agentId);

        setPipeline((prev) =>
          prev.map((step, idx) =>
            idx === i ? { ...step, status: "done", output: data.output } : step
          )
        );

        newMessages.push({
          role: "assistant",
          content: data.output,
          agent: agent?.name,
        });
      } catch (error) {
        setPipeline((prev) =>
          prev.map((step, idx) =>
            idx === i
              ? { ...step, status: "error", output: String(error) }
              : step
          )
        );
        break;
      }
    }

    setMessages((prev) => [...prev, ...newMessages]);
    setInput("");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <header className="border-b border-zinc-800 p-6">
        <h1 className="text-2xl font-bold">AI Agent Orchestrator</h1>
        <p className="text-zinc-400">
          複数の AI エージェントを組み合わせてタスクを実行
        </p>
      </header>

      <main className="mx-auto max-w-6xl p-6">
        {/* Agent Selection */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">
            エージェントを選択（実行順）
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {AGENTS.map((agent) => {
              const isSelected = selectedAgents.includes(agent.id);
              const order = selectedAgents.indexOf(agent.id) + 1;
              return (
                <button
                  key={agent.id}
                  onClick={() => toggleAgent(agent.id)}
                  className={`relative rounded-lg border-2 p-4 text-left transition-all ${
                    isSelected
                      ? "border-white bg-zinc-800"
                      : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
                  }`}
                >
                  {isSelected && (
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
                      {order}
                    </span>
                  )}
                  <div
                    className={`mb-2 inline-block rounded-lg ${agent.color} p-2 text-xl`}
                  >
                    {agent.icon}
                  </div>
                  <h3 className="font-medium">{agent.name}</h3>
                  <p className="text-sm text-zinc-400">{agent.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Pipeline Status */}
        {pipeline.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">パイプライン状態</h2>
            <div className="flex items-center gap-2">
              {pipeline.map((step, idx) => {
                const agent = AGENTS.find((a) => a.id === step.agentId);
                return (
                  <div key={idx} className="flex items-center">
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        step.status === "done"
                          ? "bg-green-600"
                          : step.status === "processing"
                          ? "animate-pulse bg-blue-600"
                          : step.status === "error"
                          ? "bg-red-600"
                          : "bg-zinc-700"
                      }`}
                    >
                      {agent?.icon} {agent?.name}
                    </div>
                    {idx < pipeline.length - 1 && (
                      <span className="mx-2 text-zinc-500">→</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Chat Interface */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900">
          <div className="max-h-96 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <p className="text-center text-zinc-500">
                エージェントを選択し、メッセージを送信してください
              </p>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-4 ${
                    msg.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {msg.agent && (
                    <span className="mb-1 block text-xs text-zinc-500">
                      {msg.agent}
                    </span>
                  )}
                  <div
                    className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-blue-600"
                        : "bg-zinc-800 text-left"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-zinc-800 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isLoading && runPipeline()}
                placeholder="メッセージを入力..."
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 focus:border-blue-500 focus:outline-none"
                disabled={isLoading}
              />
              <button
                onClick={runPipeline}
                disabled={isLoading || selectedAgents.length === 0}
                className="rounded-lg bg-blue-600 px-6 py-2 font-medium transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "実行中..." : "実行"}
              </button>
            </div>
            {selectedAgents.length === 0 && (
              <p className="mt-2 text-sm text-yellow-500">
                少なくとも1つのエージェントを選択してください
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
