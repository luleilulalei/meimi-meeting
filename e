[1mdiff --git a/src/components/ChatDrawer.vue b/src/components/ChatDrawer.vue[m
[1mindex 6af65b4..ad82bb0 100644[m
[1m--- a/src/components/ChatDrawer.vue[m
[1m+++ b/src/components/ChatDrawer.vue[m
[36m@@ -16,8 +16,8 @@[m
                     <div class="word" v-if="!itemc.mineMsg">[m
                         <!-- <img :src="itemc.headUrl"> -->[m
                         <div class="info">[m
[31m-                                <p class="time">{{itemc.nickName}}  {{itemc.timestamp}}</p>[m
[31m-                                <div class="info-content">{{itemc.contactText}}</div>[m
[32m+[m[32m                            <p class="time">{{itemc.nickName}}  {{itemc.timestamp}}</p>[m
[32m+[m[32m                            <div class="info-content">{{itemc.contactText}}</div>[m
                         </div>[m
                     </div>[m
                     <!-- 我的 -->[m
