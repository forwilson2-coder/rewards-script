#!/bin/sh
# 一次性补跑：北京午夜(UTC 16:00)后启动，补拿 10/6 桌面搜索额度（15 点）
# 用法：直接执行本脚本（由 cron 一次性任务触发）
cd /run/csi/mount-root/nas/4079184d856ecc166ed19d4887083405/workspaces/default/rewards-script || exit 1

# 清空"今日已完成"标记，避免脚本因 skipWhenCompletedToday 跳过
printf '0000-00-00' > logs/last-success.txt
echo "last-success 已临时清空（UTC $(TZ=UTC date '+%F %T')）"

nohup node dist/index.js > /tmp/rewards-run-1006-night.log 2>&1 &
echo "catchup PID: $!"
