import { getSupabaseClient } from '@/lib/supabase/client'
import { AuthHelper } from '@/lib/authHelper'

export async function loadGlobalTags(): Promise<{ name: string, count: number }[]> {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      console.warn('❌ Supabase client not available')
      return []
    }

    const userId = await AuthHelper.getUserId()
    if (!userId) {
      console.warn('❌ 無法獲取用戶 ID，無法載入雲端標籤')
      return []
    }

    const { data, error } = await supabase
      .from('user_tags')
      .select('name, count')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) {
      console.error('❌ 載入 tags 失敗:', error)
      return []
    }

    console.log(`✅ 成功載入 ${data?.length || 0} 個全域標籤`)
    return data || []

  } catch (error) {
    console.error('❌ 載入全域標籤時發生錯誤:', error)
    return []
  }
}

export async function saveGlobalTag(name: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      console.warn('❌ Supabase client not available')
      return false
    }

    const userId = await AuthHelper.getUserId()
    if (!userId) {
      console.warn('❌ 無法獲取用戶 ID，無法儲存標籤')
      return false
    }

    const { error } = await supabase.from('user_tags').upsert([
      { 
        user_id: userId,
        name: name.trim(), 
        count: 0 
      }
    ], { onConflict: 'user_id,name' })
    
    if (error) {
      console.error('❌ 儲存 tag 失敗:', error)
      return false
    } else {
      console.log(`✅ 成功儲存標籤: ${name}`)
      return true
    }

  } catch (error) {
    console.error('❌ 儲存全域標籤時發生錯誤:', error)
    return false
  }
}

export async function deleteGlobalTags(names: string[]): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      console.warn('❌ Supabase client not available')
      return false
    }

    const userId = await AuthHelper.getUserId()
    if (!userId) {
      console.warn('❌ 無法獲取用戶 ID，無法刪除標籤')
      return false
    }

    const { error } = await supabase
      .from('user_tags')
      .delete()
      .eq('user_id', userId)
      .in('name', names)
      
    if (error) {
      console.error('❌ 刪除 tag 失敗:', error)
      return false
    } else {
      console.log(`✅ 成功刪除 ${names.length} 個標籤`)
      return true
    }

  } catch (error) {
    console.error('❌ 刪除全域標籤時發生錯誤:', error)
    return false
  }
}

export async function renameGlobalTag(oldName: string, newName: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      console.warn('❌ Supabase client not available')
      return false
    }

    const userId = await AuthHelper.getUserId()
    if (!userId) {
      console.warn('❌ 無法獲取用戶 ID，無法重命名標籤')
      return false
    }

    // 先檢查新名稱是否已存在
    const { data: existing } = await supabase
      .from('user_tags')
      .select('name')
      .eq('user_id', userId)
      .eq('name', newName)
      .single()

    if (existing) {
      console.error('❌ 標籤名稱已存在:', newName)
      return false
    }

    // 更新標籤名稱
    const { error } = await supabase
      .from('user_tags')
      .update({ name: newName })
      .eq('user_id', userId)
      .eq('name', oldName)

    if (error) {
      console.error('❌ 重命名 tag 失敗:', error)
      return false
    } else {
      console.log(`✅ 成功重命名標籤: ${oldName} → ${newName}`)
      return true
    }

  } catch (error) {
    console.error('❌ 重命名全域標籤時發生錯誤:', error)
    return false
  }
}

export async function loadRecentTags(): Promise<string[]> {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      console.warn('❌ Supabase client not available')
      return []
    }

    const userId = await AuthHelper.getUserId()
    if (!userId) {
      console.warn('❌ 無法獲取用戶 ID，無法載入最近標籤')
      return []
    }

    const { data, error } = await supabase
      .from('user_recent_tags')
      .select('recent_tags')
      .eq('user_id', userId)
      .single()
      
    if (error) {
      if (error.code === 'PGRST116') return [] // 找不到資料時
      console.error('❌ 載入最近標籤失敗:', error)
      return []
    }
    
    return data?.recent_tags || []

  } catch (error) {
    console.error('❌ 載入最近標籤時發生錯誤:', error)
    return []
  }
}

export async function saveRecentTags(tags: string[]): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      console.warn('❌ Supabase client not available')
      return false
    }

    const userId = await AuthHelper.getUserId()
    if (!userId) {
      console.warn('❌ 無法獲取用戶 ID，無法儲存最近標籤')
      return false
    }

    const { error } = await supabase.from('user_recent_tags').upsert([
      { 
        user_id: userId,
        recent_tags: tags 
      }
    ], { onConflict: 'user_id' })
    
    if (error) {
      console.error('❌ 儲存最近標籤失敗:', error)
      return false
    } else {
      console.log(`✅ 成功儲存 ${tags.length} 個最近標籤`)
      return true
    }

  } catch (error) {
    console.error('❌ 儲存最近標籤時發生錯誤:', error)
    return false
  }
}