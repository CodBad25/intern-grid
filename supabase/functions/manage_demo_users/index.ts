import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  action: 'create_demo_users' | 'clear_test_data'
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('manage_demo_users: Function called with method:', req.method)
    
    // Vérifier que l'utilisateur est authentifié et admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Vérifier le rôle admin
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action }: RequestBody = await req.json()

    if (action === 'create_demo_users') {
      console.log('Creating demo users...')
      
      const demoUsers = [
        { 
          id: '11111111-1111-1111-1111-111111111111',
          email: 'badri.belhaj@demo.com',
          display_name: 'Badri Belhaj',
          role: 'tuteur'
        },
        {
          id: '22222222-2222-2222-2222-222222222222', 
          email: 'laurence.mauny@ac-nantes.fr',
          display_name: 'Laurence Mauny',
          role: 'tuteur'
        },
        {
          id: '33333333-3333-3333-3333-333333333333',
          email: 'barbara.viot@demo.com', 
          display_name: 'Barbara Viot',
          role: 'stagiaire'
        }
      ]

      // Create auth users first
      for (const user of demoUsers) {
        const { error: authError } = await supabase.auth.admin.createUser({
          user_id: user.id,
          email: user.email,
          password: 'Stag25!',
          email_confirm: true,
          user_metadata: {
            display_name: user.display_name,
            role: user.role
          }
        })

        if (authError && !authError.message.includes('already been registered')) {
          console.error(`Error creating auth user ${user.email}:`, authError)
        } else {
          console.log(`Auth user created/exists: ${user.email}`)
        }
      }

      // Now create/update profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          demoUsers.map(user => ({
            user_id: user.id,
            display_name: user.display_name,
            role: user.role
          })),
          { onConflict: 'user_id' }
        )

      if (profileError) {
        console.error('Error creating profiles:', profileError)
        return new Response(
          JSON.stringify({ error: 'Failed to create demo profiles' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Demo users created successfully')
      return new Response(
        JSON.stringify({ message: 'Demo users created successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'clear_test_data') {
      console.log('Clearing test data via RPC clear_test_data...')
      
      // Use the RPC function that bypasses RLS (SECURITY DEFINER)
      const { error: rpcError } = await supabase.rpc('clear_test_data')
      if (rpcError) {
        console.error('RPC clear_test_data error:', rpcError)
        return new Response(
          JSON.stringify({ error: 'Failed to clear test data (RPC)' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Also clear presence settings (keep profiles)
      const { error: presenceError } = await supabase
        .from('user_presence_settings')
        .delete()
        .not('id', 'is', null) // delete all rows safely without UUID casting issues
      if (presenceError) {
        console.warn('Non-critical: error clearing user_presence_settings:', presenceError)
      } else {
        console.log('Cleared user_presence_settings')
      }

      return new Response(
        JSON.stringify({ message: 'Test data cleared successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
