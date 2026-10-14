#!/bin/sh
# Daily Microsoft Rewards launcher with randomized start time.
# Cron fires at 14:23 (Asia/Shanghai); schedules the actual rewards run
# at a random offset 0..(95min-1s) => start between 14:23 and 15:58.
# Before scheduling, checks whether today (Asia/Shanghai) is already done
# (logs/last-success.txt matches today) -> skip, don't run again.
WINDOW_SECONDS=5700
WORKDIR=/run/csi/mount-root/nas/4079184d856ecc166ed19d4887083405/workspaces/default/rewards-script
LOG=/tmp/rewards-daily.log
STATE_FILE="$WORKDIR/logs/last-success.txt"

# 1) 今日已完成（北京时间）？已完成则跳过
TODAY=$(TZ=Asia/Shanghai date +%F)
if [ -f "$STATE_FILE" ]; then
    DONE=$(cat "$STATE_FILE" | tr -d '[:space:]')
    if [ "$DONE" = "$TODAY" ]; then
        echo "$(date '+%F %T') [skip] 今天(北京时间 $TODAY)已完成，跳过运行" >> "$LOG"
        echo "skipped: today ($TODAY) already completed"
        exit 0
    fi
fi

# 2) 随机延迟 0..5699 秒（14:23 -> 15:58）
RANDOM_SECONDS=$(( (RANDOM * WINDOW_SECONDS) / 32768 ))
if [ "$RANDOM_SECONDS" -ge "$WINDOW_SECONDS" ]; then
    RANDOM_SECONDS=$((WINDOW_SECONDS - 1))
fi

echo "$(date '+%F %T') [cron] rewards 将在 ${RANDOM_SECONDS}s 后启动（窗口 14:23-15:58）" >> "$LOG"

nohup sh -c "sleep ${RANDOM_SECONDS}; echo \"\$(date '+%F %T') [start] 启动 rewards\" >> ${LOG}; cd ${WORKDIR} && nohup node dist/index.js >> /tmp/rewards-run.log 2>&1 &" > /dev/null 2>&1 &

echo "scheduled rewards start in ${RANDOM_SECONDS}s (window 14:23-15:58)"
exit 0