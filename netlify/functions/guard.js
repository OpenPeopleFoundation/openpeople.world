const { createClient } = require('@supabase/supabase-js');

exports.handler = async event => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }
    };
  }

  const authHeader = event.headers.authorization || event.headers.Authorization;
  const token = authHeader?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return response(401, { error: 'Missing bearer token' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured');
    return response(500, { error: 'Server misconfigured' });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return response(401, { error: 'Invalid or expired token' });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_member, roles')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile lookup error', profileError);
      return response(500, { error: 'Unable to load profile' });
    }

    if (!profile?.is_member) {
      return response(403, { error: 'Membership required' });
    }

    return response(200, { ok: true, roles: profile.roles || [] });
  } catch (error) {
    console.error('Guard error', error);
    return response(500, { error: 'Unexpected error' });
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}
