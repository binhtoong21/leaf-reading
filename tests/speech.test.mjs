import test from 'node:test';
import assert from 'node:assert/strict';
import {pickEnglishVoice,speechText,SPEECH_MAX} from '../src/lib/speech.ts';
test('pickEnglishVoice prefers en-US, then en-GB, then other English, local voices only',()=>{
 const usRemote={lang:'en-US',localService:false},usLocal={lang:'en-US',localService:true},gb={lang:'en-GB',localService:true},au={lang:'en-AU',localService:true};assert.equal(pickEnglishVoice([au,gb,usRemote,usLocal]),usLocal);assert.equal(pickEnglishVoice([au,gb,usRemote]),gb);assert.equal(pickEnglishVoice([usRemote,{lang:'en-GB',localService:false}]),null);assert.equal(pickEnglishVoice([au,gb]),gb);assert.equal(pickEnglishVoice([au]),au);
});
test('pickEnglishVoice accepts case and underscore variations',()=>{const us={lang:'en_US'},remote={lang:'EN-us'};assert.equal(pickEnglishVoice([us]),us);assert.equal(pickEnglishVoice([remote]),remote)});
test('pickEnglishVoice never uses non-English voices',()=>{assert.equal(pickEnglishVoice([{lang:'vi-VN'}]),null);assert.equal(pickEnglishVoice([]),null)});
test('speechText collapses whitespace and limits length',()=>{assert.equal(speechText('  one\n\t two   three  '),'one two three');assert.equal(speechText('x'.repeat(SPEECH_MAX+1)).length,SPEECH_MAX)});
