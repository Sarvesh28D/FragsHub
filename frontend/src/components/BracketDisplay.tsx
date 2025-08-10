'use client';

import { useState, useEffect } from 'react';
import { Trophy, Users, Calendar, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Match {
  id: string;
  player1: string | null;
  player2: string | null;
  winner: string | null;
  round: number;
  position: number;
  scheduledTime?: Date;
  completed: boolean;
}

interface Tournament {
  id: string;
  name: string;
  state: 'pending' | 'underway' | 'complete';
  participants: Array<{
    id: string;
    name: string;
  }>;
  matches: Match[];
}

interface BracketDisplayProps {
  tournament: Tournament | null;
  loading?: boolean;
  className?: string;
}

const BracketDisplay = ({ tournament, loading, className }: BracketDisplayProps) => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  if (loading) {
    return (
      <div className={cn('bg-secondary-800 rounded-lg p-8', className)}>
        <div className="animate-pulse">
          <div className="h-8 bg-secondary-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-20 bg-secondary-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className={cn(
        'bg-secondary-800 rounded-lg p-8 text-center border border-secondary-700',
        className
      )}>
        <Trophy className="h-16 w-16 text-secondary-600 mx-auto mb-4" />
        <h3 className="text-accent-200 text-lg font-medium mb-2">
          No Tournament Active
        </h3>
        <p className="text-accent-400">
          Tournament brackets will appear here once teams are registered and approved.
        </p>
      </div>
    );
  }

  const getRoundName = (round: number, totalRounds: number) => {
    if (round === totalRounds) return 'Final';
    if (round === totalRounds - 1) return 'Semi-Final';
    if (round === totalRounds - 2) return 'Quarter-Final';
    return `Round ${round}`;
  };

  const totalRounds = Math.max(...tournament.matches.map(m => m.round));
  const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1);

  const getMatchesByRound = (round: number) => {
    return tournament.matches
      .filter(m => m.round === round)
      .sort((a, b) => a.position - b.position);
  };

  const MatchCard = ({ match }: { match: Match }) => (
    <div
      className={cn(
        'bg-secondary-700 rounded-lg p-4 border cursor-pointer transition-all duration-200',
        match.completed 
          ? 'border-green-500/50 hover:border-green-500' 
          : 'border-secondary-600 hover:border-primary-500/50',
        selectedMatch?.id === match.id && 'ring-2 ring-primary-500'
      )}
      onClick={(e) => {
        e.preventDefault();
        console.log('Match card clicked:', match.id);
        setSelectedMatch(match);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          console.log('Match card selected via keyboard:', match.id);
          setSelectedMatch(match);
        }
      }}
    >
      <div className="space-y-2">
        <div className={cn(
          'flex items-center justify-between p-2 rounded',
          match.winner === match.player1 ? 'bg-green-500/20 text-green-400' : 'bg-secondary-600'
        )}>
          <span className="text-sm font-medium">
            {match.player1 || 'TBD'}
          </span>
          {match.winner === match.player1 && <Trophy className="h-4 w-4" />}
        </div>
        
        <div className="text-center text-accent-500 text-xs">vs</div>
        
        <div className={cn(
          'flex items-center justify-between p-2 rounded',
          match.winner === match.player2 ? 'bg-green-500/20 text-green-400' : 'bg-secondary-600'
        )}>
          <span className="text-sm font-medium">
            {match.player2 || 'TBD'}
          </span>
          {match.winner === match.player2 && <Trophy className="h-4 w-4" />}
        </div>
      </div>
      
      {match.scheduledTime && (
        <div className="mt-2 flex items-center space-x-1 text-xs text-accent-400">
          <Calendar className="h-3 w-3" />
          <span>{match.scheduledTime.toLocaleDateString()}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className={cn('bg-secondary-800 rounded-lg p-6', className)}>
      {/* Tournament Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-accent-100">{tournament.name}</h2>
          <div className={cn(
            'px-3 py-1 rounded-full text-sm font-medium',
            tournament.state === 'complete' && 'bg-green-500/20 text-green-400',
            tournament.state === 'underway' && 'bg-yellow-500/20 text-yellow-400',
            tournament.state === 'pending' && 'bg-blue-500/20 text-blue-400'
          )}>
            {tournament.state === 'complete' && 'Completed'}
            {tournament.state === 'underway' && 'Live'}
            {tournament.state === 'pending' && 'Upcoming'}
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-accent-300">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span className="text-sm">{tournament.participants.length} teams</span>
          </div>
          <div className="flex items-center space-x-1">
            <Trophy className="h-4 w-4" />
            <span className="text-sm">{tournament.matches.filter(m => m.completed).length}/{tournament.matches.length} matches completed</span>
          </div>
        </div>
      </div>

      {/* Bracket Grid */}
      <div className="overflow-x-auto">
        <div className="grid grid-flow-col gap-6 min-w-max">
          {rounds.map(round => (
            <div key={round} className="min-w-[250px]">
              <h3 className="text-accent-200 font-medium mb-4 text-center">
                {getRoundName(round, totalRounds)}
              </h3>
              <div className="space-y-4">
                {getMatchesByRound(round).map(match => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Match Details Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary-800 rounded-lg p-6 max-w-md w-full border border-secondary-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-accent-100">Match Details</h3>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Match details modal close button clicked');
                  setSelectedMatch(null);
                }}
                className="text-accent-400 hover:text-accent-200 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md p-1"
                type="button"
                aria-label="Close match details"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-accent-200 font-medium mb-2">Participants</h4>
                <div className="space-y-2">
                  <div className={cn(
                    'p-3 rounded border',
                    selectedMatch.winner === selectedMatch.player1 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-secondary-600'
                  )}>
                    <div className="flex items-center justify-between">
                      <span className="text-accent-100">{selectedMatch.player1 || 'TBD'}</span>
                      {selectedMatch.winner === selectedMatch.player1 && (
                        <Trophy className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className={cn(
                    'p-3 rounded border',
                    selectedMatch.winner === selectedMatch.player2 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-secondary-600'
                  )}>
                    <div className="flex items-center justify-between">
                      <span className="text-accent-100">{selectedMatch.player2 || 'TBD'}</span>
                      {selectedMatch.winner === selectedMatch.player2 && (
                        <Trophy className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedMatch.scheduledTime && (
                <div>
                  <h4 className="text-accent-200 font-medium mb-2">Scheduled Time</h4>
                  <div className="flex items-center space-x-2 text-accent-300">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedMatch.scheduledTime.toLocaleString()}</span>
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-accent-200 font-medium mb-2">Status</h4>
                <div className={cn(
                  'px-3 py-2 rounded text-sm font-medium',
                  selectedMatch.completed 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                )}>
                  {selectedMatch.completed ? 'Completed' : 'Pending'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BracketDisplay;
