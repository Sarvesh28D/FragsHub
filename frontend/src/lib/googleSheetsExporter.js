// Google Sheets API integration for data export
export class GoogleSheetsExporter {
  constructor(apiKey, sheetId) {
    this.apiKey = apiKey;
    this.sheetId = sheetId;
    this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
  }

  async createNewSheet(sheetName) {
    try {
      const response = await fetch(`${this.baseUrl}/${this.sheetId}:batchUpdate?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            addSheet: {
              properties: {
                title: sheetName,
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 20
                }
              }
            }
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create sheet');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating sheet:', error);
      throw error;
    }
  }

  async exportTeamsData(teams) {
    const sheetName = `Teams_${new Date().toISOString().split('T')[0]}`;
    
    // Prepare headers
    const headers = [
      'Team ID', 'Team Name', 'Captain Name', 'Captain Email', 'Members Count',
      'Registration Date', 'Payment Status', 'Transaction ID', 'Total Amount',
      'Region', 'Discord Server', 'Contact Number'
    ];

    // Prepare data rows
    const rows = teams.map(team => [
      team.id,
      team.name,
      team.captain.name,
      team.captain.email,
      team.members.length,
      team.registrationDate,
      team.paymentStatus,
      team.transactionId || '',
      team.totalAmount,
      team.region || '',
      team.discordServer || '',
      team.contactNumber || ''
    ]);

    const data = [headers, ...rows];

    try {
      await this.createNewSheet(sheetName);
      
      const response = await fetch(
        `${this.baseUrl}/${this.sheetId}/values/${sheetName}!A1:L${data.length}?valueInputOption=USER_ENTERED&key=${this.apiKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: data
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to export teams data');
      }

      return {
        success: true,
        sheetName,
        recordsExported: teams.length,
        sheetUrl: `https://docs.google.com/spreadsheets/d/${this.sheetId}/edit#gid=0`
      };
    } catch (error) {
      console.error('Error exporting teams data:', error);
      throw error;
    }
  }

  async exportTournamentResults(tournament, matches) {
    const sheetName = `Tournament_Results_${tournament.id}`;
    
    const headers = [
      'Match ID', 'Round', 'Team 1', 'Team 2', 'Team 1 Score', 'Team 2 Score',
      'Winner', 'Match Date', 'Duration', 'Map', 'Status'
    ];

    const rows = matches.map(match => [
      match.id,
      match.round,
      match.team1.name,
      match.team2.name,
      match.team1.score,
      match.team2.score,
      match.winner,
      match.date,
      match.duration || '',
      match.map || '',
      match.status
    ]);

    const data = [headers, ...rows];

    try {
      await this.createNewSheet(sheetName);
      
      const response = await fetch(
        `${this.baseUrl}/${this.sheetId}/values/${sheetName}!A1:K${data.length}?valueInputOption=USER_ENTERED&key=${this.apiKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: data
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to export tournament results');
      }

      return {
        success: true,
        sheetName,
        recordsExported: matches.length,
        sheetUrl: `https://docs.google.com/spreadsheets/d/${this.sheetId}/edit#gid=0`
      };
    } catch (error) {
      console.error('Error exporting tournament results:', error);
      throw error;
    }
  }

  async exportPrizeDistribution(tournament, teams) {
    const sheetName = `Prize_Distribution_${tournament.id}`;
    
    const headers = [
      'Position', 'Team Name', 'Team ID', 'Prize Amount', 'Prize Percentage',
      'Captain Name', 'Captain Email', 'Payment Method', 'Payment Status', 'Payout Date'
    ];

    // Filter teams by their final positions
    const winnersData = teams
      .filter(team => team.finalPosition && team.finalPosition <= 4)
      .sort((a, b) => a.finalPosition - b.finalPosition)
      .map(team => {
        const prizeInfo = tournament.prizeDistribution.find(p => p.position === team.finalPosition);
        return [
          team.finalPosition,
          team.name,
          team.id,
          prizeInfo?.amount || 0,
          prizeInfo?.percentage || 0,
          team.captain.name,
          team.captain.email,
          team.paymentMethod || 'Bank Transfer',
          team.payoutStatus || 'Pending',
          team.payoutDate || ''
        ];
      });

    const data = [headers, ...winnersData];

    try {
      await this.createNewSheet(sheetName);
      
      const response = await fetch(
        `${this.baseUrl}/${this.sheetId}/values/${sheetName}!A1:J${data.length}?valueInputOption=USER_ENTERED&key=${this.apiKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: data
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to export prize distribution');
      }

      return {
        success: true,
        sheetName,
        recordsExported: winnersData.length,
        sheetUrl: `https://docs.google.com/spreadsheets/d/${this.sheetId}/edit#gid=0`
      };
    } catch (error) {
      console.error('Error exporting prize distribution:', error);
      throw error;
    }
  }

  async exportFullTournamentReport(tournament) {
    const timestamp = new Date().toISOString().split('T')[0];
    const sheetName = `Full_Report_${tournament.id}_${timestamp}`;
    
    // Tournament overview data
    const overviewHeaders = ['Metric', 'Value'];
    const overviewData = [
      ['Tournament Name', tournament.name],
      ['Game', tournament.game],
      ['Start Date', tournament.startDate],
      ['End Date', tournament.endDate],
      ['Total Teams', tournament.registeredTeams],
      ['Prize Pool', tournament.prizePool],
      ['Registration Fee', tournament.registrationFee],
      ['Status', tournament.status],
      ['Total Revenue', tournament.registeredTeams * tournament.registrationFee],
      ['Export Date', new Date().toISOString()]
    ];

    const fullData = [
      ['TOURNAMENT OVERVIEW'],
      overviewHeaders,
      ...overviewData,
      [''], // Empty row
      ['PRIZE DISTRIBUTION'],
      ['Position', 'Percentage', 'Amount'],
      ...tournament.prizeDistribution.map(prize => [
        prize.position,
        `${prize.percentage}%`,
        prize.amount
      ])
    ];

    try {
      await this.createNewSheet(sheetName);
      
      const response = await fetch(
        `${this.baseUrl}/${this.sheetId}/values/${sheetName}!A1:C${fullData.length}?valueInputOption=USER_ENTERED&key=${this.apiKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: fullData
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to export full tournament report');
      }

      return {
        success: true,
        sheetName,
        sheetUrl: `https://docs.google.com/spreadsheets/d/${this.sheetId}/edit#gid=0`
      };
    } catch (error) {
      console.error('Error exporting full tournament report:', error);
      throw error;
    }
  }
}

// Usage example and configuration
export const sheetsConfig = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY,
  sheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID,
};

export const createExporter = () => {
  if (!sheetsConfig.apiKey || !sheetsConfig.sheetId) {
    throw new Error('Google Sheets API key and Sheet ID must be configured');
  }
  return new GoogleSheetsExporter(sheetsConfig.apiKey, sheetsConfig.sheetId);
};
