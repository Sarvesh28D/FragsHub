import Image from 'next/image';
import { Users, Mail, Crown, Trophy, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Player {
  name: string;
  role?: string;
  isCaptain?: boolean;
}

interface Team {
  id: string;
  name: string;
  logo?: string;
  players: Player[];
  captainEmail: string;
  entryFee: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  registrationStatus: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

interface TeamCardProps {
  team: Team;
  isAdmin?: boolean;
  onApprove?: (teamId: string) => void;
  onReject?: (teamId: string) => void;
  className?: string;
}

const TeamCard = ({ team, isAdmin, onApprove, onReject, className }: TeamCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-500 bg-green-500/10';
      case 'rejected':
        return 'text-red-500 bg-red-500/10';
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'paid':
        return 'text-green-500 bg-green-500/10';
      case 'failed':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      'bg-secondary-800 rounded-lg border border-secondary-700 p-6 hover:border-primary-500/50 transition-all duration-200',
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {team.logo ? (
            <Image
              src={team.logo}
              alt={`${team.name} logo`}
              width={48}
              height={48}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-secondary-700 rounded-lg flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary-500" />
            </div>
          )}
          <div>
            <h3 className="text-accent-100 font-semibold text-lg">{team.name}</h3>
            <p className="text-accent-400 text-sm">Team ID: {team.id}</p>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-col space-y-2">
          <div className={cn(
            'flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
            getStatusColor(team.registrationStatus)
          )}>
            {getStatusIcon(team.registrationStatus)}
            <span className="capitalize">{team.registrationStatus}</span>
          </div>
          <div className={cn(
            'flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
            getStatusColor(team.paymentStatus)
          )}>
            {getStatusIcon(team.paymentStatus)}
            <span className="capitalize">{team.paymentStatus}</span>
          </div>
        </div>
      </div>

      {/* Team Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-accent-300">
          <Mail className="h-4 w-4" />
          <span className="text-sm">{team.captainEmail}</span>
        </div>
        <div className="flex items-center space-x-2 text-accent-300">
          <Users className="h-4 w-4" />
          <span className="text-sm">{team.players.length} players</span>
        </div>
      </div>

      {/* Players List */}
      <div className="mb-4">
        <h4 className="text-accent-200 font-medium text-sm mb-2">Players</h4>
        <div className="space-y-1">
          {team.players.map((player, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              {player.isCaptain && <Crown className="h-3 w-3 text-yellow-500" />}
              <span className={cn(
                player.isCaptain ? 'text-accent-100 font-medium' : 'text-accent-300'
              )}>
                {player.name}
              </span>
              {player.role && (
                <span className="text-accent-500 text-xs">({player.role})</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Entry Fee */}
      <div className="flex items-center justify-between text-sm mb-4">
        <span className="text-accent-300">Entry Fee:</span>
        <span className="text-accent-100 font-medium">₹{team.entryFee}</span>
      </div>

      {/* Registration Date */}
      <div className="flex items-center justify-between text-sm mb-4">
        <span className="text-accent-300">Registered:</span>
        <span className="text-accent-100">
          {team.createdAt.toLocaleDateString()}
        </span>
      </div>

      {/* Admin Actions */}
      {isAdmin && team.registrationStatus === 'pending' && (
        <div className="flex space-x-2 pt-4 border-t border-secondary-700">
          <button
            onClick={(e) => {
              e.preventDefault();
              console.log('Approve button clicked for team:', team.id);
              onApprove?.(team.id);
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            type="button"
          >
            Approve
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              console.log('Reject button clicked for team:', team.id);
              onReject?.(team.id);
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            type="button"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamCard;
