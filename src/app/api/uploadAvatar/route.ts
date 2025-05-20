import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

// アップロードされた画像を保存するディレクトリ
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'avatars');

export async function POST(req: NextRequest) {
  try {
    // リクエストからファイルデータを取得
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const fileType = formData.get('fileType') as string;

    if (!file || !name || !fileType) {
      return NextResponse.json(
        { error: 'ファイル、名前、またはファイルタイプが指定されていません' },
        { status: 400 }
      );
    }

    // ファイルサイズのチェック（10MB以下）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ファイルサイズは10MB以下にしてください' },
        { status: 400 }
      );
    }

    // ファイルタイプのチェック
    if (!['image/gif', 'video/mp4'].includes(file.type)) {
      return NextResponse.json(
        { error: 'GIFまたはMP4ファイルのみアップロード可能です' },
        { status: 400 }
      );
    }

    // アップロードディレクトリの作成（存在しない場合）
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (error) {
      console.error('ディレクトリ作成エラー:', error);
    }

    // ファイル名の生成（タイムスタンプ + オリジナル名）
    const timestamp = Date.now();
    const fileName = `${timestamp}_${name.replace(/[^a-zA-Z0-9]/g, '_')}.${fileType}`;
    const filePath = join(UPLOAD_DIR, fileName);

    // ファイルの保存
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 保存したファイルのURLを返す
    const fileUrl = `/uploads/avatars/${fileName}`;
    return NextResponse.json({ 
      success: true, 
      fileUrl,
      fileName,
      fileType,
      name
    });

  } catch (error) {
    console.error('ファイルアップロードエラー:', error);
    return NextResponse.json(
      { error: 'ファイルのアップロードに失敗しました' },
      { status: 500 }
    );
  }
} 