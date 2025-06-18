#!/bin/bash
cd /home/kavia/workspace/code-generation/goalsaver-60260-9d7cd147/goal_saver_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

