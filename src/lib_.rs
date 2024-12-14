#![cfg_attr(not(feature = "export-abi"), no_main)]

extern crate alloc;

#[allow(unused_imports)]
use stylus_sdk::{ alloy_primitives::{ U256, U8 }, prelude::* };
use alloy_primitives::{ Address, Uint };
// use stylus_sdk::storage::{StorageString, StorageVec};

sol_storage! {
    #[entrypoint]
    pub struct Song {
        mapping(address => string) users; 
        mapping(address => uint256) wallets;
        mapping(uint8 => string[]) usersvec;
        mapping(address => string[]) txns;
        mapping(address => string[]) songs; 
    }
}

#[public]
impl Song {
    pub fn buy_song(
        &mut self,
        buyer: Address,
        buyer_song_data: String,
        update_buyer_data: String,
        seller: Address,
        seller_song_data: String,
        update_seller_data: String,
        song_id: String,
    ) {
        let mut buyer_accessor = self.users.setter(buyer);
        buyer_accessor.set_str(update_buyer_data);

        let mut buyer_song_accessor = self.songs.setter(buyer);
        let mut buyer_song_slot = buyer_song_accessor.grow();
        buyer_song_slot.set_str(&buyer_song_data);

        if !song_id.is_empty() {
            let mut seller_accessor = self.users.setter(seller);
            seller_accessor.set_str(update_seller_data);

            let mut seller_song_accessor = self.songs.setter(seller);
            let id: u8 = song_id.parse().unwrap(); // convert it to u8
            if let Some(mut element) = seller_song_accessor.get_mut(id) {
                element.set_str(&seller_song_data);
            }
        }
    }

    pub fn change_price(&mut self, user: Address, song_id: u8, update_song_data: String) {
        let mut user_song_accessor = self.songs.setter(user);
        if let Some(mut element) = user_song_accessor.get_mut(song_id) {
            element.set_str(&update_song_data);
        }
    }

    pub fn send_token(
        &mut self,
        sender: Address,
        receiver: Address,
        amount: Uint<256, 4>,
        sender_activity: String,
        receiver_activity: String
    ) {
        let mut sender_wallet_accessor = self.wallets.setter(sender);
        let sender_tokens = sender_wallet_accessor.get();
        sender_wallet_accessor.set(sender_tokens - amount);

        let mut receiver_wallet_accessor = self.wallets.setter(receiver);
        let receiver_tokens = receiver_wallet_accessor.get();
        receiver_wallet_accessor.set(receiver_tokens + amount);

        let mut sender_accessor = self.txns.setter(sender);
        let mut new_sender_slot = sender_accessor.grow();
        new_sender_slot.set_str(&sender_activity);

        let mut receiver_accessor = self.txns.setter(receiver);
        let mut new_receiver_slot = receiver_accessor.grow();
        new_receiver_slot.set_str(&receiver_activity);
    }

    pub fn create_newuser(
        &mut self,
        user: Address,
        address: String,
        data: String,
        zero_id: u8,
        amount: Uint<256, 4>,
        activity: String
    ) {
        let mut user_accessor = self.users.setter(user);
        user_accessor.set_str(data);

        let mut users_accessor = self.usersvec.setter(U8::from(zero_id));
        let mut new_slot = users_accessor.grow();
        new_slot.set_str(&address);

        let mut receiver_wallet_accessor = self.wallets.setter(user);
        receiver_wallet_accessor.set(amount);

        let mut receiver_accessor = self.txns.setter(user);
        let mut new_receiver_slot = receiver_accessor.grow();
        new_receiver_slot.set_str(&activity);
    }

    pub fn create_user(&mut self, user: Address, address: String, data: String, zero_id: u8) {
        let mut user_accessor = self.users.setter(user);
        user_accessor.set_str(data);
    }

    pub fn get_user(&self, user_address: Address) -> String {
        let user = self.users.getter(user_address);
        return user.get_string();
    }

    pub fn get_users(&self) -> Vec<String> {
        let users_accessor = self.usersvec.get(U8::from(0));
        let mut users = Vec::new();
        for i in 0..users_accessor.len() {
            if let Some(users_guard) = users_accessor.get(i) {
                users.push(users_guard.get_string());
            }
        }
        users
    }

    pub fn get_wallet(&self, user_address: Address) -> Uint<256, 4> {
        return self.wallets.get(user_address);
    }

    pub fn get_songs(&self, user_address: Address) -> Vec<String> {
        let songs_accessor = self.songs.get(user_address);
        let mut songs = Vec::new();
        for i in 0..songs_accessor.len() {
            if let Some(songs_guard) = songs_accessor.get(i) {
                songs.push(songs_guard.get_string());
            }
        }
        songs
    }

    pub fn get_txns(&self, user_address: Address) -> Vec<String> {
        let txns_accessor = self.txns.get(user_address);
        let mut txns = Vec::new();
        for i in 0..txns_accessor.len() {
            if let Some(txns_guard) = txns_accessor.get(i) {
                txns.push(txns_guard.get_string());
            }
        }
        txns
    }
}
