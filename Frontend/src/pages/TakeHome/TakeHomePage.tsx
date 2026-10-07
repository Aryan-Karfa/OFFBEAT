import React, { useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { useTakeHomeStore } from "../../stores/takeHomeStore";
import {
  TakeHomeHero,
  TakeHomeCategoryStrip,
  TakeHomeItemCard,
  TakeHomeWhyPanel,
  WhereToFindModal,
  TakeHomeAlternativesModal,
  TakeHomeCommunityPicks,
} from "../../features/take-home";
import { Loader2, PackageOpen } from "lucide-react";

export const TakeHomePage: React.FC = () => {
  const { destinationId: paramDestId } = useParams<{ destinationId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fromPlace = searchParams.get("fromPlace");
  const targetDestination = paramDestId || "dest_darjeeling";

  const {
    destinationInfo,
    items,
    selectedItem,
    reasoning,
    category,
    giftFor,
    verifiedOnly,
    loading,
    error,
    fallback,
    isWhereToFindOpen,
    isAlternativesOpen,
    fetchTakeHome,
    fetchTakeHomeForPlace,
    setCategory,
    setGiftFor,
    setVerifiedOnly,
    openWhereToFind,
    closeWhereToFind,
    openAlternatives,
    closeAlternatives,
    selectItem,
  } = useTakeHomeStore();

  useEffect(() => {
    if (fromPlace) {
      fetchTakeHomeForPlace(fromPlace);
    } else {
      fetchTakeHome(targetDestination);
    }
  }, [paramDestId, fromPlace]);

  const destinationDisplayName = destinationInfo?.name || "Darjeeling";

  const handleSelectDestination = (destId: string) => {
    navigate(`/take-home/${destId}`);
  };

  const handleSelectAlternative = (altId: string) => {
    const matched = items.find((i) => i.id === altId);
    if (matched) {
      selectItem(matched);
      openWhereToFind(matched);
    }
  };

  return (
    <div className="w-full min-h-screen bg-offbeat-bg pb-20">
      <Section spacing="md">
        <Container size="lg">
          {/* Hero Section */}
          <TakeHomeHero
            destinationName={destinationDisplayName}
            source={reasoning?.source || "DETERMINISTIC"}
            fallback={fallback}
            totalItems={items.length}
            onSelectDestination={handleSelectDestination}
            activeDestinationId={paramDestId || "dest_darjeeling"}
          />

          {/* Category & Gift Filter Strip */}
          <TakeHomeCategoryStrip
            selectedCategory={category}
            onSelectCategory={setCategory}
            selectedGiftFor={giftFor}
            onSelectGiftFor={setGiftFor}
            verifiedOnly={verifiedOnly}
            onToggleVerifiedOnly={setVerifiedOnly}
          />

          {/* Loading State */}
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <Text className="text-sm font-medium text-offbeat-secondary">
                Discovering authentic local specialties in {destinationDisplayName}...
              </Text>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-center mb-8">
              <Text className="text-sm font-semibold text-red-400 mb-2">
                Failed to load take-home recommendations
              </Text>
              <Text variant="muted" className="text-xs">
                {error}
              </Text>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Why OFFBEAT Recommends This Panel */}
              <TakeHomeWhyPanel reasoning={reasoning} destinationName={destinationDisplayName} />

              {/* Items Grid */}
              {items.length > 0 ? (
                <div className="mb-14">
                  <div className="flex items-center justify-between mb-6">
                    <Heading level={2} size="h3" className="text-2xl font-bold text-white">
                      Top Verified Finds ({items.length})
                    </Heading>
                    <span className="text-xs text-offbeat-muted">
                      Ranked by destination relevance & traveler signals
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, idx) => (
                      <TakeHomeItemCard
                        key={item.id}
                        item={item}
                        onOpenWhereToFind={openWhereToFind}
                        onOpenAlternatives={openAlternatives}
                        isPrimary={idx === 0}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                /* Truthful Empty State */
                <div className="p-12 rounded-3xl bg-offbeat-surface border border-dashed border-offbeat-border text-center mb-12">
                  <PackageOpen className="w-12 h-12 text-offbeat-muted mx-auto mb-3 opacity-60" />
                  <Heading level={3} size="h4" className="text-lg font-bold text-white mb-2">
                    No Matching Finds in {destinationDisplayName}
                  </Heading>
                  <Text variant="muted" className="text-xs max-w-md mx-auto mb-4">
                    OFFBEAT doesn't have enough verified local information for this category here
                    yet. We never invent products or tourist traps.
                  </Text>
                  <button
                    onClick={() => {
                      setCategory("ALL");
                      setGiftFor(null);
                      setVerifiedOnly(false);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-black transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

              {/* Community Endorsed Picks */}
              <TakeHomeCommunityPicks items={items} destinationName={destinationDisplayName} />
            </>
          )}

          {/* Where to Find Modal */}
          <WhereToFindModal
            item={selectedItem}
            isOpen={isWhereToFindOpen}
            onClose={closeWhereToFind}
          />

          {/* Alternatives Modal */}
          <TakeHomeAlternativesModal
            item={selectedItem}
            isOpen={isAlternativesOpen}
            onClose={closeAlternatives}
            onSelectAlternative={handleSelectAlternative}
          />
        </Container>
      </Section>
    </div>
  );
};
