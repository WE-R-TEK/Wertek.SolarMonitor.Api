echo 'Compilando...'
npm run build-deploy
echo 'Compactando arquivos...'
cd dist
tar czf deploy.tgz *
cd ../certificate
echo 'Parando serviço...'
ssh -i solar-monitor-api.pem ubuntu@ec2-54-68-63-227.us-west-2.compute.amazonaws.com "sudo pm2 stop 0"
echo 'Removendo versão anterior...'
ssh -i solar-monitor-api.pem ubuntu@ec2-54-68-63-227.us-west-2.compute.amazonaws.com "sudo rm -r /var/www/public/api-power.we-rtek.com/*"
echo 'Enviando arquivos...'
scp -i solar-monitor-api.pem ../dist/deploy.tgz ubuntu@ec2-54-68-63-227.us-west-2.compute.amazonaws.com:/var/www/public/api-power.we-rtek.com
echo 'Descompactando arquivos...'
ssh -i solar-monitor-api.pem ubuntu@ec2-54-68-63-227.us-west-2.compute.amazonaws.com "sudo tar -xzf /var/www/public/api-power.we-rtek.com/deploy.tgz -C /var/www/public/api-power.we-rtek.com/"
echo 'Removendo arquivos compactados...'
ssh -i solar-monitor-api.pem ubuntu@ec2-54-68-63-227.us-west-2.compute.amazonaws.com "sudo rm /var/www/public/api-power.we-rtek.com/deploy.tgz"
echo 'Instalando dependências...'
ssh -i solar-monitor-api.pem ubuntu@ec2-54-68-63-227.us-west-2.compute.amazonaws.com "cd /var/www/public/api-power.we-rtek.com/ && sudo npm install --only=production"
echo 'Iniciando serviço...'
ssh -i solar-monitor-api.pem ubuntu@ec2-54-68-63-227.us-west-2.compute.amazonaws.com "sudo pm2 start 0"
echo 'Deploy finalizado!'
cd ..
