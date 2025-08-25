import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🧪 Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('count(*)')
      .limit(1)

    console.log('📊 Supabase test result:', { data, error })

    if (error) {
      console.error('❌ Supabase connection failed:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 })
    }

    console.log('✅ Supabase connection successful')
    return NextResponse.json({
      success: true,
      message: 'Supabase connection working',
      result: data
    })
  } catch (error) {
    console.error('❌ Test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
