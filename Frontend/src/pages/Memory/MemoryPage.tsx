import React, { useEffect } from "react";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { useMemoryStore } from "../../stores/memoryStore";
import { MemorySettings, MemoryList } from "../../features/memory";
import { Brain, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export const MemoryPage: React.FC = () => {
  const {
    memories,
    memoryEnabled,
    loading,
    error,
    fetchMemories,
    removeMemory,
    clearAllMemories,
    toggleMemoryEnabled,
  } = useMemoryStore();

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  return (
    <div className="min-h-screen bg-offbeat-background pb-16">
      <Section className="pt-6 pb-2">
        <Container>
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 text-xs font-medium text-offbeat-muted hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Discovery
            </Link>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-offbeat-surface border border-offbeat-border text-offbeat-secondary">
              <Brain className="w-3.5 h-3.5 text-amber-400" />
              <span>TRAVELER INTELLIGENCE</span>
            </div>
          </div>

          <div className="max-w-2xl mb-8">
            <Heading
              level={1}
              size="h1"
              className="text-3xl md:text-4xl font-black text-white mb-2"
            >
              Your OFFBEAT Memory
            </Heading>
            <Text variant="body" className="text-offbeat-secondary text-sm">
              OFFBEAT remembers how you like to travel without surveillance or profile selling.
              Inspect, adjust, or delete any signal at any time.
            </Text>
          </div>

          {error && (
            <div className="p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
              {error}
            </div>
          )}

          {loading && memories.length === 0 ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
              <p className="text-xs text-offbeat-muted">Loading your traveler memories...</p>
            </div>
          ) : (
            <>
              {/* Settings and Controls */}
              <MemorySettings
                memoryEnabled={memoryEnabled}
                totalMemories={memories.length}
                onToggleEnabled={toggleMemoryEnabled}
                onClearAll={clearAllMemories}
              />

              {/* Memory List */}
              {memoryEnabled && (
                <div>
                  <div className="mb-4">
                    <Heading
                      level={2}
                      size="h3"
                      className="text-lg md:text-xl font-bold text-white mb-1"
                    >
                      Remembered Travel Signals
                    </Heading>
                    <Text variant="muted">
                      Transparent signals that influence discovery ranking, alternative stops, and
                      local find suggestions.
                    </Text>
                  </div>

                  <MemoryList memories={memories} onRemove={removeMemory} />
                </div>
              )}
            </>
          )}
        </Container>
      </Section>
    </div>
  );
};
