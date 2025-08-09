export default function Page() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      color: 'white',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
          🎮 FragsHub
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '40px', opacity: 0.9 }}>
          Ultimate Esports Tournament Platform
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '30px',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>🏆 Tournament Management</h3>
            <p>Create and manage esports tournaments with automated bracket generation.</p>
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '30px',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>💳 Payment Integration</h3>
            <p>Secure payment processing with Razorpay for tournament registrations.</p>
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '30px',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>👥 Team Management</h3>
            <p>Easy team registration and management system for players.</p>
          </div>
        </div>

        <div style={{
          background: 'rgba(0,0,0,0.2)',
          padding: '20px',
          borderRadius: '10px',
          marginTop: '40px'
        }}>
          <h3 style={{ marginBottom: '15px' }}>System Status</h3>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{
              background: '#4CAF50',
              padding: '10px 20px',
              borderRadius: '5px',
              fontWeight: 'bold'
            }}>
              ✅ Frontend: Active
            </div>
            <div style={{
              background: '#2196F3',
              padding: '10px 20px',
              borderRadius: '5px',
              fontWeight: 'bold'
            }}>
              ✅ Backend: Port 3001
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '30px' }}>
          <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
            Ready for competitive gaming tournaments!
          </p>
        </div>
      </div>
    </div>
  )
}
