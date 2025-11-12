#!/bin/bash
# Script para crear y configurar Signer de Neynar

set -e

echo "🔐 Setup de Neynar Signer para Farcaster Scheduler"
echo "=================================================="
echo ""

# Pedir API Key
read -p "Ingresa tu NEYNAR_API_KEY: " NEYNAR_API_KEY

if [ -z "$NEYNAR_API_KEY" ]; then
    echo "❌ Error: NEYNAR_API_KEY es requerido"
    exit 1
fi

echo ""
echo "📝 Creando nuevo signer..."
echo ""

# Crear signer
RESPONSE=$(curl -s -X POST https://api.neynar.com/v2/farcaster/signer \
  -H "accept: application/json" \
  -H "api_key: $NEYNAR_API_KEY" \
  -H "content-type: application/json")

# Extraer signer_uuid y approval_url
SIGNER_UUID=$(echo $RESPONSE | grep -o '"signer_uuid":"[^"]*' | sed 's/"signer_uuid":"//')
APPROVAL_URL=$(echo $RESPONSE | grep -o '"signer_approval_url":"[^"]*' | sed 's/"signer_approval_url":"//')

if [ -z "$SIGNER_UUID" ]; then
    echo "❌ Error al crear signer. Respuesta de Neynar:"
    echo "$RESPONSE"
    exit 1
fi

echo "✅ Signer creado exitosamente!"
echo ""
echo "📋 Signer UUID: $SIGNER_UUID"
echo ""
echo "⚠️  IMPORTANTE: Debes aprobar el signer en Warpcast"
echo ""
echo "👉 Abre este link en tu navegador:"
echo ""
echo "$APPROVAL_URL"
echo ""
read -p "Presiona ENTER después de aprobar el signer en Warpcast..."

echo ""
echo "🔍 Verificando estado del signer..."
echo ""

# Verificar estado
STATUS_RESPONSE=$(curl -s "https://api.neynar.com/v2/farcaster/signer?signer_uuid=$SIGNER_UUID" \
  -H "accept: application/json" \
  -H "api_key: $NEYNAR_API_KEY")

STATUS=$(echo $STATUS_RESPONSE | grep -o '"status":"[^"]*' | sed 's/"status":"//')
FID=$(echo $STATUS_RESPONSE | grep -o '"fid":[^,}]*' | sed 's/"fid"://')

echo "Estado: $STATUS"
echo "FID: $FID"
echo ""

if [ "$STATUS" != "approved" ]; then
    echo "⚠️  El signer aún no está aprobado"
    echo "Por favor aprueba el signer en Warpcast y ejecuta este comando para verificar:"
    echo ""
    echo "curl \"https://api.neynar.com/v2/farcaster/signer?signer_uuid=$SIGNER_UUID\" \\"
    echo "  -H \"api_key: $NEYNAR_API_KEY\""
    echo ""
else
    echo "✅ Signer aprobado correctamente!"
    echo ""
fi

echo "=================================================="
echo "📝 RESUMEN"
echo "=================================================="
echo ""
echo "1. Signer UUID (guárdalo):"
echo "   $SIGNER_UUID"
echo ""
echo "2. NEYNAR_API_KEY (para variables de entorno):"
echo "   $NEYNAR_API_KEY"
echo ""
echo "=================================================="
echo "📋 PRÓXIMOS PASOS"
echo "=================================================="
echo ""
echo "1. Actualizar base de datos en Render:"
echo "   - Ve a: https://dashboard.render.com"
echo "   - Click en: farcaster-scheduler-db"
echo "   - Click en: Connect → PSQL Command"
echo "   - Ejecuta:"
echo ""
echo "   UPDATE \"User\""
echo "   SET \"signerUuid\" = '$SIGNER_UUID'"
echo "   WHERE fid = $FID;"
echo ""
echo "2. Desplegar worker con NEYNAR_API_KEY"
echo ""
echo "3. ¡Listo para publicar casts! 🚀"
echo ""
