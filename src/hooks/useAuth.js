import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // Check if JWT is expired and sign out user
        if (error.code === 'PGRST301' || error.message?.includes('JWT expired')) {
          console.log('JWT expired, signing out user')
          await supabase.auth.signOut()
          return
        }
        console.error('Error fetching profile:', error)
      } else {
        setProfile(data)
      }
    } catch (error) {
      // Check if JWT is expired and sign out user
      if (error.code === 'PGRST301' || error.message?.includes('JWT expired')) {
        console.log('JWT expired, signing out user')
        await supabase.auth.signOut()
        return
      }
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, fullName, phoneNumber = '') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      throw error
    }

    if (data.user) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            phone_number: phoneNumber,
            role: 'user',
          },
        ])

      if (profileError) {
        throw profileError
      }
    }

    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  }

  const isAdmin = profile?.role === 'admin'

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin,
  }
}