import test from 'node:test';
import assert from 'node:assert/strict';
import {formatNote} from '../src/lib/lookup.ts';
const entry={headword:'textile',ipa:'/ˈtek.staɪl/',pos:'danh từ',kind:'vocabulary',meaningVi:'hàng dệt',senseInContext:'Ngành dệt may.',collocations:[{en:'textile industry',vi:'ngành dệt may'}],examples:[{en:'Vietnam has a large textile industry.',vi:'Việt Nam có ngành dệt may lớn.'}],contrasts:[{word:'fabric',explanation:'vải, chất liệu cụ thể'}],tip:'',insufficientContext:false};
test('formatNote renders all filled sections',()=>{
 assert.equal(formatNote(entry),'textile /ˈtek.staɪl/ · danh từ\nTrong bài: Ngành dệt may.\n\nCách dùng thường gặp:\n- textile industry: ngành dệt may\n\nVí dụ:\nVietnam has a large textile industry.\n→ Việt Nam có ngành dệt may lớn.\n\nPhân biệt:\n- fabric: vải, chất liệu cụ thể');
});
test('formatNote skips empty sections and adds the tip',()=>{
 assert.equal(formatNote({...entry,ipa:'',pos:'',collocations:[],examples:[],contrasts:[],tip:'Nhớ “text” = dệt.'}),'textile\nTrong bài: Ngành dệt may.\n\nMẹo ghi nhớ: Nhớ “text” = dệt.');
});
